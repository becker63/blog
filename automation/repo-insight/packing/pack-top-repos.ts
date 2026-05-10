import { RepoPack } from "./types";
import { RepoCatalog } from "../model/types";
import { AccessibleRepo } from "./types";
import { packRepoWithRepomix } from "./repomix-pack";

export const packTopRepos = async ({
  catalog,
  repos,
  maxTotalBytes = Number(process.env.REPO_INSIGHT_MAX_TOTAL_PACK_BYTES ?? "300000"),
}: {
  catalog: RepoCatalog;
  repos?: AccessibleRepo[];
  maxTotalBytes?: number;
}): Promise<RepoPack[]> => {
  if (!repos) {
    throw new Error("packTopRepos requires an explicit selected repo list.");
  }
  const selectedRepos = repos;
  const packs: RepoPack[] = [];
  let totalBytes = 0;

  for (const repo of selectedRepos) {
    if (totalBytes >= maxTotalBytes) break;
    const perRepoLimit = Math.max(1, Math.min(Number(process.env.REPO_INSIGHT_MAX_PACK_BYTES ?? "100000"), maxTotalBytes - totalBytes));
    const pack = await packRepoWithRepomix(repo, perRepoLimit);
    packs.push(pack);
    totalBytes += pack.stats.byteCount;
  }

  return packs;
};
