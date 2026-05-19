import fs from "node:fs";
import path from "node:path";
import { publicationsFileSchema, type Publication } from "./schemas";
import { publicationsFilePath } from "./paths";

export const readPublications = (launchId: string): Publication[] => {
  const filePath = publicationsFilePath(launchId);
  if (!fs.existsSync(filePath)) return [];
  const raw = JSON.parse(fs.readFileSync(filePath, "utf8"));
  return publicationsFileSchema.parse(raw).publications;
};

export const writePublications = (launchId: string, publications: Publication[]): void => {
  const filePath = publicationsFilePath(launchId);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(
    filePath,
    `${JSON.stringify({ publications }, null, 2)}\n`,
  );
};

export const upsertPublication = (
  launchId: string,
  publication: Publication,
): Publication[] => {
  const existing = readPublications(launchId);
  const index = existing.findIndex((p) => p.id === publication.id);
  const next = [...existing];
  if (index >= 0) next[index] = publication;
  else next.push(publication);
  writePublications(launchId, next);
  return next;
};
