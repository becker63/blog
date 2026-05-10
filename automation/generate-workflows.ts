import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { workflowDefinitions } from "./repo-insight/workflows/definitions";
import { renderWorkflow } from "./repo-insight/workflows/emit";
import { workflowsDir } from "./repo-insight/storage/paths";

const main = async () => {
  await mkdir(workflowsDir, { recursive: true });

  for (const workflow of workflowDefinitions) {
    const targetPath = path.join(workflowsDir, workflow.filename);
    await writeFile(targetPath, renderWorkflow(workflow), "utf8");
    console.log(`Wrote ${path.relative(process.cwd(), targetPath)}`);
  }
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
