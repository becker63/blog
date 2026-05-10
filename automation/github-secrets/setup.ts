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
  new Promise<void>((resolve, reject) => {
    const child = spawn("gh", args, {
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stderr = "";
    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`gh ${args.slice(0, 2).join(" ")} failed: ${stderr.trim()}`));
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

const promptLine = async (rl: readline.Interface | undefined, answers: string[], label: string, defaultValue?: string) => {
  const suffix = defaultValue ? ` (${defaultValue})` : "";
  if (!input.isTTY) {
    console.log(`${label}${suffix}: `);
    return nextPipedAnswer(answers) || defaultValue || "";
  }
  if (!rl) throw new Error("Interactive prompt unavailable.");
  const value = (await rl.question(`${label}${suffix}: `)).trim();
  return value || defaultValue || "";
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

const main = async () => {
  const dryRun = hasFlag("--dry-run");
  console.log("Checking gh auth...");
  await checkGhAuth();

  const pipedAnswers = await readPipedAnswers();
  const rl = input.isTTY ? readline.createInterface({ input, output }) : undefined;
  try {
    const defaultBlogRepo = process.env.GITHUB_REPOSITORY;
    const blogRepo = getFlagValue("--blog-repo") ?? (await promptLine(rl, pipedAnswers, "Blog repo", defaultBlogRepo));
    validateRepo(blogRepo, "Blog repo");

    console.log("CURSOR_API_KEY is the Cursor SDK key used by the blog workflow.");
    const cursorApiKey = await promptSecret(rl, pipedAnswers, "CURSOR_API_KEY");
    if (!cursorApiKey) throw new Error("CURSOR_API_KEY cannot be blank.");

    console.log("GH_REPO_INSIGHT_TOKEN should be a fine-grained read-only PAT for source repos (Contents: read, Metadata: read).");
    const repoInsightToken = await promptSecret(rl, pipedAnswers, "GH_REPO_INSIGHT_TOKEN");
    if (!repoInsightToken) throw new Error("GH_REPO_INSIGHT_TOKEN cannot be blank.");

    const cursorModel = await promptLine(rl, pipedAnswers, "Optional CURSOR_MODEL, blank to skip", "composer-2");
    const compactionModel = await promptLine(rl, pipedAnswers, "Optional CURSOR_COMPACTION_MODEL, blank to skip", "composer-2");
    const sourceRepoInput =
      getFlagValue("--source-repos") ??
      (await promptLine(rl, pipedAnswers, "Source repos for BLOG_REPO_DISPATCH_TOKEN, comma-separated, blank to skip"));

    const sourceRepos = sourceRepoInput
      .split(",")
      .map((repo) => repo.trim())
      .filter(Boolean);
    for (const repo of sourceRepos) validateRepo(repo, "Source repo");

    const dispatchToken = sourceRepos.length
      ? await promptSecret(rl, pipedAnswers, "BLOG_REPO_DISPATCH_TOKEN")
      : "";
    if (sourceRepos.length && !dispatchToken) {
      throw new Error("BLOG_REPO_DISPATCH_TOKEN cannot be blank when source repos are provided.");
    }

    console.log(`Setting blog repo secrets for ${blogRepo}`);
    await setSecret(blogRepo, "CURSOR_API_KEY", cursorApiKey, dryRun);
    await setSecret(blogRepo, "GH_REPO_INSIGHT_TOKEN", repoInsightToken, dryRun);
    if (cursorModel) await setVariable(blogRepo, "CURSOR_MODEL", cursorModel, dryRun);
    if (compactionModel) await setVariable(blogRepo, "CURSOR_COMPACTION_MODEL", compactionModel, dryRun);

    if (sourceRepos.length > 0) {
      console.log("Setting source repo dispatch secrets");
      for (const repo of sourceRepos) {
        await setSecret(repo, "BLOG_REPO_DISPATCH_TOKEN", dispatchToken, dryRun);
        console.log(`Configured BLOG_REPO_DISPATCH_TOKEN for ${repo}`);
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
