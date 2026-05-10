import { readFile } from "node:fs/promises";
import { repoCatalogSchema } from "../model/schemas";
import { RepoCatalog, RepoCatalogEntry } from "../model/types";
import { repoCatalogPath } from "./paths";

export const emptyRepoCatalog = (): RepoCatalog => ({
  schemaVersion: 1,
  repos: [],
});

export const readRepoCatalog = async (): Promise<RepoCatalog> => {
  try {
    const raw = await readFile(repoCatalogPath, "utf8");
    return repoCatalogSchema.parse(JSON.parse(raw));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return emptyRepoCatalog();
    }
    throw error;
  }
};

export const findEnabledRepo = (
  catalog: RepoCatalog,
  fullName: string,
): RepoCatalogEntry | undefined =>
  catalog.repos.find((repo) => repo.enabled && repo.fullName === fullName);

export const findRepoOverlay = (
  catalog: RepoCatalog,
  fullName: string,
): RepoCatalogEntry | undefined => catalog.repos.find((repo) => repo.fullName === fullName);
