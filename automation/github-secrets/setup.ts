import { spawn } from "node:child_process";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const repoPattern = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;

const getFlagValue = (name: string) => {
  const index = process.argv.indexOf(name);
  if (index >= 0) return process.argv[index + 1];
  const prefix = `${name}=`;
  return process.argv.find((arg) => arg.startsWith(prefix))?.slice(prefix.length);
};

const hasFlag = (name: string) => process.argv.includes(name);

const execGh = (args: string[], stdinValue?: string) =>
  new Promise<string>((resolve, reject) => {
    const child = spawn("gh", args, {
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += String(chunk);
    });
    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve(stdout);
        return;
      }
      reject(new Error(`gh ${args.slice(0, 2).join(" ")} failed: ${stderr.trim() || `exit code ${code}`}`));
    });
    child.stdin.end(stdinValue ?? "");
  });

const checkGhAuth = async () => {
  try {
    await execGh(["auth", "status"]);
  } catch {
    throw new Error("GitHub CLI is not authenticated. Run `gh auth login` first.");
  }
};

const readPipedAnswers = async () => {
  if (input.isTTY) return [];
  const chunks: Buffer[] = [];
  for await (const chunk of input) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks).toString("utf8").split(/\r?\n/);
};

const nextPipedAnswer = (answers: string[]) => answers.shift()?.trim() ?? "";

const promptLine = async (
  rl: readline.Interface | undefined,
  answers: string[],
  label: string,
  defaultValue?: string,
  options: { useDefaultOnBlank?: boolean } = {},
) => {
  const useDefaultOnBlank = options.useDefaultOnBlank ?? true;
  const suffix = defaultValue ? ` (${defaultValue})` : "";
  if (!input.isTTY) {
    console.log(`${label}${suffix}: `);
    const value = nextPipedAnswer(answers);
    return value || (useDefaultOnBlank ? defaultValue || "" : "");
  }
  if (!rl) throw new Error("Interactive prompt unavailable.");
  const value = (await rl.question(`${label}${suffix}: `)).trim();
  return value || (useDefaultOnBlank ? defaultValue || "" : "");
};

const promptSecret = async (rl: readline.Interface | undefined, answers: string[], label: string) => {
  if (!input.isTTY) {
    console.log(`${label}: `);
    return nextPipedAnswer(answers);
  }
  if (!rl) throw new Error("Interactive prompt unavailable.");

  const originalWrite = output.write;
  let muted = false;
  output.write = ((chunk: string | Uint8Array, encoding?: BufferEncoding, cb?: (err?: Error | null) => void) => {
    if (muted) return true;
    return originalWrite.call(output, chunk, encoding, cb);
  }) as typeof output.write;

  try {
    output.write(`${label}: `);
    muted = true;
    const value = (await rl.question("")).trim();
    muted = false;
    if (input.isTTY) output.write("\n");
    return value;
  } finally {
    muted = false;
    output.write = originalWrite;
  }
};

const validateRepo = (repo: string, label: string) => {
  if (!repoPattern.test(repo)) throw new Error(`${label} must use owner/repo format: ${repo}`);
};

const parseNameListJson = (raw: string) => {
  const parsed = JSON.parse(raw) as unknown;
  if (!Array.isArray(parsed)) throw new Error("Expected a JSON array.");
  return new Set(
    parsed
      .map((item) => (typeof item === "object" && item !== null && "name" in item ? String(item.name) : ""))
      .filter(Boolean),
  );
};

const parseNameListPlain = (raw: string) =>
  new Set(
    raw
      .split(/\r?\n/)
      .map((line) => line.trim().split(/\s+/)[0])
      .filter((name) => name && name.toUpperCase() !== "NAME"),
  );

const listRepoNames = async (repo: string, kind: "secret" | "variable") => {
  try {
    return parseNameListJson(await execGh([kind, "list", "--repo", repo, "--json", "name"]));
  } catch (jsonError) {
    try {
      return parseNameListPlain(await execGh([kind, "list", "--repo", repo]));
    } catch (plainError) {
      throw new Error(
        `Unable to list GitHub Actions ${kind}s for ${repo}. Check gh auth and repository permissions. ${
          plainError instanceof Error ? plainError.message : String(plainError)
        }`,
        { cause: jsonError },
      );
    }
  }
};

const listRepoSecrets = (repo: string) => listRepoNames(repo, "secret");

const listRepoVariables = (repo: string) => listRepoNames(repo, "variable");

const setSecret = async (repo: string, name: string, value: string, dryRun: boolean) => {
  if (dryRun) {
    console.log(`Would set secret ${name} for ${repo}`);
    return;
  }
  await execGh(["secret", "set", name, "--repo", repo], value);
  console.log(`Set secret ${name}`);
};

const setVariable = async (repo: string, name: string, value: string, dryRun: boolean) => {
  if (dryRun) {
    console.log(`Would set variable ${name} for ${repo}`);
    return;
  }
  await execGh(["variable", "set", name, "--repo", repo, "--body", value]);
  console.log(`Set variable ${name}`);
};

type PromptContext = {
  rl: readline.Interface | undefined;
  answers: string[];
};

type EnsureResult = {
  configured: boolean;
  changed: boolean;
};

const ensureSecret = async ({
  repo,
  name,
  label = name,
  explanation,
  required = false,
  existingSecrets,
  dryRun,
  overwrite,
  prompt,
  skipMessage,
}: {
  repo: string;
  name: string;
  label?: string;
  explanation?: string;
  required?: boolean;
  existingSecrets: Set<string>;
  dryRun: boolean;
  overwrite: boolean;
  prompt: PromptContext;
  skipMessage?: string;
}): Promise<EnsureResult> => {
  if (!overwrite && existingSecrets.has(name)) {
    console.log(`Secret ${name} already set for ${repo}; skipping`);
    return { configured: true, changed: false };
  }

  if (explanation) console.log(explanation);
  const value = await promptSecret(prompt.rl, prompt.answers, label);
  if (!value) {
    if (required) throw new Error(`${name} cannot be blank.`);
    console.log(skipMessage ?? `Optional ${name} not provided; skipping`);
    return { configured: false, changed: false };
  }

  await setSecret(repo, name, value, dryRun);
  return { configured: true, changed: true };
};

const ensureVariable = async ({
  repo,
  name,
  label = name,
  defaultValue,
  required = false,
  existingVariables,
  dryRun,
  overwrite,
  prompt,
}: {
  repo: string;
  name: string;
  label?: string;
  defaultValue?: string;
  required?: boolean;
  existingVariables: Set<string>;
  dryRun: boolean;
  overwrite: boolean;
  prompt: PromptContext;
}): Promise<EnsureResult> => {
  if (!overwrite && existingVariables.has(name)) {
    console.log(`Variable ${name} already set for ${repo}; skipping`);
    return { configured: true, changed: false };
  }

  const value = await promptLine(prompt.rl, prompt.answers, label, defaultValue, {
    useDefaultOnBlank: !overwrite && Boolean(defaultValue),
  });
  if (!value) {
    if (required) throw new Error(`${name} cannot be blank.`);
    console.log(`Optional ${name} not provided; skipping`);
    return { configured: false, changed: false };
  }

  await setVariable(repo, name, value, dryRun);
  return { configured: true, changed: true };
};

const main = async () => {
  const dryRun = hasFlag("--dry-run");
  const overwrite = hasFlag("--overwrite") || hasFlag("--force");
  console.log("Checking gh auth...");
  await checkGhAuth();

  const pipedAnswers = await readPipedAnswers();
  const rl = input.isTTY ? readline.createInterface({ input, output }) : undefined;
  try {
    const defaultBlogRepo = process.env.GITHUB_REPOSITORY;
    const blogRepo = getFlagValue("--blog-repo") ?? (await promptLine(rl, pipedAnswers, "Blog repo", defaultBlogRepo));
    validateRepo(blogRepo, "Blog repo");
    console.log(`Blog repo: ${blogRepo}`);
    if (overwrite) console.log("Overwrite mode enabled; existing values may be replaced when non-empty values are provided.");

    console.log("Reading existing blog repo secrets/variables...");
    const blogSecrets = await listRepoSecrets(blogRepo);
    const blogVariables = await listRepoVariables(blogRepo);
    const prompt = { rl, answers: pipedAnswers };

    await ensureSecret({
      repo: blogRepo,
      name: "CURSOR_API_KEY",
      explanation: "CURSOR_API_KEY is the Cursor SDK key used by the blog workflow.",
      required: true,
      existingSecrets: blogSecrets,
      dryRun,
      overwrite,
      prompt,
    });

    await ensureSecret({
      repo: blogRepo,
      name: "GH_REPO_INSIGHT_TOKEN",
      explanation: "GH_REPO_INSIGHT_TOKEN should be a fine-grained read-only PAT for source repos (Contents: read, Metadata: read).",
      required: true,
      existingSecrets: blogSecrets,
      dryRun,
      overwrite,
      prompt,
      skipMessage: "Optional CACHIX_AUTH_TOKEN not provided; skipping Cachix setup.",
    });

    await ensureVariable({
      repo: blogRepo,
      name: "CURSOR_MODEL",
      label: "Optional CURSOR_MODEL, blank to skip",
      defaultValue: "composer-2",
      existingVariables: blogVariables,
      dryRun,
      overwrite,
      prompt,
    });

    await ensureVariable({
      repo: blogRepo,
      name: "CURSOR_COMPACTION_MODEL",
      label: "Optional CURSOR_COMPACTION_MODEL, blank to skip",
      defaultValue: "composer-2",
      existingVariables: blogVariables,
      dryRun,
      overwrite,
      prompt,
    });

    const cachix = await ensureSecret({
      repo: blogRepo,
      name: "CACHIX_AUTH_TOKEN",
      label: "Optional CACHIX_AUTH_TOKEN",
      explanation:
        "CACHIX_AUTH_TOKEN is optional. Leave blank to skip Nix binary cache. If provided, GitHub Actions will use Cachix instead of Magic Nix Cache / FlakeHub. This is only for GitHub Actions speed, not repo-insight product logic.",
      existingSecrets: blogSecrets,
      dryRun,
      overwrite,
      prompt,
    });
    if (cachix.configured) {
      await ensureVariable({
        repo: blogRepo,
        name: "CACHIX_CACHE_NAME",
        label: "Optional CACHIX_CACHE_NAME",
        defaultValue: "becker63",
        existingVariables: blogVariables,
        dryRun,
        overwrite,
        prompt,
      });
    }

    const sourceRepoInput =
      getFlagValue("--source-repos") ??
      (await promptLine(rl, pipedAnswers, "Source repos for BLOG_REPO_DISPATCH_TOKEN, comma-separated, blank to skip"));

    const sourceRepos = sourceRepoInput
      .split(",")
      .map((repo) => repo.trim())
      .filter(Boolean);
    for (const repo of sourceRepos) validateRepo(repo, "Source repo");

    if (sourceRepos.length > 0) {
      console.log("Reading existing source repo dispatch secrets...");
      const reposNeedingDispatchToken: string[] = [];
      for (const repo of sourceRepos) {
        const sourceSecrets = await listRepoSecrets(repo);
        if (!overwrite && sourceSecrets.has("BLOG_REPO_DISPATCH_TOKEN")) {
          console.log(`Secret BLOG_REPO_DISPATCH_TOKEN already set for ${repo}; skipping`);
        } else {
          reposNeedingDispatchToken.push(repo);
        }
      }

      if (reposNeedingDispatchToken.length > 0) {
        const dispatchToken = await promptSecret(rl, pipedAnswers, "BLOG_REPO_DISPATCH_TOKEN");
        if (!dispatchToken) {
          throw new Error("BLOG_REPO_DISPATCH_TOKEN cannot be blank when selected source repos need it.");
        }
        console.log("Setting source repo dispatch secrets");
        for (const repo of reposNeedingDispatchToken) {
          await setSecret(repo, "BLOG_REPO_DISPATCH_TOKEN", dispatchToken, dryRun);
          console.log(`Configured BLOG_REPO_DISPATCH_TOKEN for ${repo}`);
        }
      }
    }

    console.log("Done");
  } finally {
    rl?.close();
  }
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
