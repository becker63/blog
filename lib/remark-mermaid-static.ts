import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";
import { visit } from "unist-util-visit";

const TMP_DIR = path.join(process.cwd(), ".mermaid-cache");
fs.mkdirSync(TMP_DIR, { recursive: true });

export default function remarkMermaidStatic() {
  return (tree: any) => {
    visit(tree, "code", (node: any, index: number | null, parent: any) => {
      if (!parent || index === null) return;
      if (node.lang !== "mermaid") return;

      const hash = Buffer.from(node.value).toString("base64url").slice(0, 12);
      const mmdPath = path.join(TMP_DIR, `${hash}.mmd`);
      const svgPath = path.join(TMP_DIR, `${hash}.svg`);

      fs.writeFileSync(mmdPath, node.value);

      execFileSync(
        "pnpm",
        [
          "exec",
          "mmdc",
          "-i",
          mmdPath,
          "-o",
          svgPath,
          "-b",
          "transparent",
          "-c",
          path.join(process.cwd(), "mermaid.config.json"),
        ],
        { stdio: "ignore" },
      );

      const svg = fs.readFileSync(svgPath, "utf8");

      parent.children[index] = {
        type: "html",
        value: `<div class="mermaid-diagram">${svg}</div>`,
      };
    });
  };
}
