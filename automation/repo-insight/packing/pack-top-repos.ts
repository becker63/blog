import { RepoPack } from "./types";
import { discoverTopRepos } from "../adapters/github-repos";
import { DispatchPayload, RepoCatalog } from "../model/types";
import { packRepoWithRepomix } from "./repomix-pack";

export const packTopRepos = async ({
  catalog,
  triggerHint,
}: {
  catalog: RepoCatalog;
  triggerHint?: DispatchPayload;
}): Promise<RepoPack[]> => {
  const repos = await discoverTopRepos({ catalog, triggerHint });
  const packs: RepoPack[] = [];

  for (const repo of repos) {
    packs.push(await packRepoWithRepomix(repo));
  }

  return packs;
};
