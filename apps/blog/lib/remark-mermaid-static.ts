import { execFileSync, execSync } from "child_process";
import fs from "fs";
import path from "path";
import { visit } from "unist-util-visit";
import type { Parent, Literal } from "unist";

import { getWorkspaceRoot } from "./workspaceRoot";

const workspaceRoot = getWorkspaceRoot();
const TMP_DIR = path.join(workspaceRoot, ".mermaid-cache");
fs.mkdirSync(TMP_DIR, { recursive: true });

/**
 * Prefer a working system browser for Mermaid CLI. Puppeteer's cache under
 * ~/.cache/puppeteer can contain a Chrome build for the wrong architecture,
 * which makes `mmdc` fail at build time with "cannot execute binary file".
 */
function resolveChromiumExecutable(): string | undefined {
  const fromEnv = process.env.PUPPETEER_EXECUTABLE_PATH?.trim();
  if (fromEnv && fs.existsSync(fromEnv)) {
    return fromEnv;
  }
  const names = [
    "chromium",
    "chromium-browser",
    "google-chrome-stable",
    "google-chrome",
  ];
  for (const name of names) {
    try {
      const out = execSync(`command -v ${name} 2>/dev/null`, {
        encoding: "utf8",
        shell: "/bin/sh",
      }).trim();
      if (out && fs.existsSync(out)) return out;
    } catch {
      /* try next */
    }
  }
  for (const candidate of [
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/usr/bin/google-chrome-stable",
  ]) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return undefined;
}

export default function remarkMermaidStatic() {
  return (tree: any) => {
    visit(tree, "code", (node: any, index, parent: Parent | undefined) => {
      if (!parent || typeof index !== "number") return;
      if (node.lang !== "mermaid") return;

      const hash = Buffer.from(node.value).toString("base64url").slice(0, 12);
      const mmdPath = path.join(TMP_DIR, `${hash}.mmd`);
      const svgPath = path.join(TMP_DIR, `${hash}.svg`);

      fs.writeFileSync(mmdPath, node.value);

      const chromium = resolveChromiumExecutable();
      const env = { ...process.env };
      if (chromium) {
        env.PUPPETEER_EXECUTABLE_PATH = chromium;
      }

      execFileSync(
        "bunx",
        [
          "mmdc",
          "-i",
          mmdPath,
          "-o",
          svgPath,
          "-b",
          "transparent",
          "-c",
          path.join(workspaceRoot, "mermaid.config.json"),
        ],
        { stdio: "inherit", env },
      );

      const svg = fs.readFileSync(svgPath, "utf8");

      const htmlNode: Literal = {
        type: "html",
        value: `<div class="mermaid-diagram">${svg}</div>`,
      };

      parent.children.splice(index, 1, htmlNode);
    });
  };
}
