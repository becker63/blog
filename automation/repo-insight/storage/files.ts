import { readdir } from "node:fs/promises";
import path from "node:path";

export const listFiles = async (
  root: string,
  predicate: (filePath: string) => boolean = () => true,
): Promise<string[]> => {
  const results: string[] = [];

  const visit = async (dir: string) => {
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return;
      throw error;
    }

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await visit(fullPath);
      } else if (entry.isFile() && predicate(fullPath)) {
        results.push(fullPath);
      }
    }
  };

  await visit(root);
  return results.sort();
};
