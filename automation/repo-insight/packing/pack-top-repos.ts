import { RepoPack } from "./types";
import { discoverTopRepos } from "../adapters/github-repos";
import { RepoCatalog } from "../model/types";
import { AccessibleRepo } from "./types";
import { packRepoWithRepomix } from "./repomix-pack";

export const packTopRepos = async ({
  catalog,
  repos,
}: {
  catalog: RepoCatalog;
  repos?: AccessibleRepo[];
}): Promise<RepoPack[]> => {
  const selectedRepos = repos ?? (await discoverTopRepos({ catalog }));
  const packs: RepoPack[] = [];

  for (const repo of selectedRepos) {
    packs.push(await packRepoWithRepomix(repo));
  }

  return packs;
};
