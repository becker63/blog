import { readFile } from "node:fs/promises";
import path from "node:path";
import { workflowDefinitions } from "./repo-insight/workflows/definitions";
import { renderWorkflow } from "./repo-insight/workflows/emit";
import { workflowsDir } from "./repo-insight/storage/paths";

const main = async () => {
  const stale: string[] = [];

  for (const workflow of workflowDefinitions) {
    const targetPath = path.join(workflowsDir, workflow.filename);
    let committed = "";
    try {
      committed = await readFile(targetPath, "utf8");
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }

    const generated = renderWorkflow(workflow);
    if (committed !== generated) stale.push(path.relative(process.cwd(), targetPath));
  }

  if (stale.length > 0) {
    throw new Error(`Generated workflows are stale or missing: ${stale.join(", ")}. Run pnpm automation:generate-workflows.`);
  }

  console.log("Generated workflows are up to date.");
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
