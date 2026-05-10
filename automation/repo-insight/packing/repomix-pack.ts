import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { runSubprocess } from "../adapters/subprocess";
import { AccessibleRepo, RepoPack } from "./types";
import { checkoutRepo } from "./checkout-repo";

const DEFAULT_MAX_PACK_BYTES = 200_000;

const repomixStyle = () => process.env.REPO_INSIGHT_PACK_STYLE ?? "xml";

const maxPackBytesFor = (repo: AccessibleRepo) =>
  repo.overlay?.maxPackBytes ??
  repo.overlay?.inspect.maxTotalBytes ??
  Number(process.env.REPO_INSIGHT_MAX_PACK_BYTES ?? DEFAULT_MAX_PACK_BYTES);

const truncatePack = (text: string, maxBytes: number) => {
  const bytes = Buffer.byteLength(text);
  if (bytes <= maxBytes) {
    return {
      text,
      byteCount: bytes,
      truncated: false,
    };
  }

  const truncated = Buffer.from(text).subarray(0, maxBytes).toString("utf8");
  const note = `\n\n<!-- repo-insight: Repomix output truncated to ${maxBytes} bytes before compaction. -->\n`;
  return {
    text: `${truncated}${note}`,
    byteCount: Buffer.byteLength(truncated) + Buffer.byteLength(note),
    truncated: true,
  };
};

export const packRepoWithRepomix = async (repo: AccessibleRepo): Promise<RepoPack> => {
  const checkout = await checkoutRepo(repo);
  const outputDir = await mkdtemp(path.join(os.tmpdir(), "repo-insight-repomix-"));
  const outputPath = path.join(outputDir, `repomix-output.${repomixStyle() === "markdown" ? "md" : "xml"}`);

  try {
    await runSubprocess(
      "repomix",
      [
        "--quiet",
        "--compress",
        "--style",
        repomixStyle(),
        ...(repo.overlay?.ignorePatterns.length ? ["--ignore", repo.overlay.ignorePatterns.join(",")] : []),
        "-o",
        outputPath,
      ],
      "",
      { cwd: checkout.path },
    );

    const rawOutput = await readFile(outputPath, "utf8");
    const maxPackBytes = maxPackBytesFor(repo);
    const packed = truncatePack(rawOutput, maxPackBytes);

    return {
      fullName: repo.fullName,
      pushedAt: repo.pushedAt,
      defaultBranch: repo.defaultBranch,
      source: checkout.source,
      safeToQuote: repo.overlay?.safeToQuote === true,
      tool: "repomix",
      style: repomixStyle(),
      compressed: true,
      maxPackBytes,
      stats: {
        byteCount: packed.byteCount,
        truncated: packed.truncated,
        includedFileCount: 0,
        ignoredFileCount: 0,
      },
      packedText: packed.text,
    };
  } finally {
    await rm(outputDir, { recursive: true, force: true });
    await checkout.cleanup();
  }
};
