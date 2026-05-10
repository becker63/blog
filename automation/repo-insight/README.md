# Repo Insight Automation

This subsystem turns recent repository activity into one direct writing-curation run.

Run `pnpm generate-insight`. It asks GitHub for the top recently pushed repos the token can access, packs them with Repomix compression, compacts those packs with Cursor, and asks Cursor whether there is anything worth turning into an insight. If yes, it writes one insight artifact and opens one blog repo issue. If no, it writes nothing.

## Architecture

- `cli/generate-insight.ts` is the product command.
- `adapters/github-repos.ts` asks GitHub for accessible repos sorted by recent push activity.
- `packing/` checks out the top repos into temporary directories, packs them with Repomix, and compacts those packs into project capsules.
- `context/` reads `data/repo-insight-context.json`, summarizes local writing plus configured `../career-ops` writing/profile sources, and caches only typed context capsules.
- `adapters/` keeps Cursor SDK, GitHub repo discovery, and GitHub issue publishing isolated.
- `content/insights/` stores generated draft artifacts. Nothing here is published by the existing blog post pipeline.
- GitHub issues in this blog repo are the canonical notification and review inbox for generated insights.
- `workflows/definitions.ts` is the source of truth for generated GitHub Actions YAML.

## Commands

- `pnpm generate-insight`
- `pnpm generate-insight:force`
- `pnpm insight:taste-profile`
- `pnpm insight:index`
- `pnpm insight:validate`
- `pnpm automation:generate-workflows`
- `pnpm automation:check-workflows`
- `pnpm automation:actionlint`

Use `nix develop` for the reproducible tool environment. Package scripts remain the command surface.
Repomix is provided by the Nix dev shell and is invoked with `--compress`; pack files stay in OS temp directories and are not committed.

`pnpm generate-insight` does not require a payload. A `repository_dispatch` payload may be used as optional trigger metadata, but manual CLI runs infer the trigger from the top recently pushed repo.

Cursor output is schema-validated. Near-miss JSON gets one schema repair attempt, and force mode requires one artifact with `artifact.frontmatter` and `artifact.sections`. `pnpm generate-insight:force` uses the same packing and compaction path, but requires one artifact and one issue. It also does not require a payload. `no_insight` is invalid in force mode.

## Secrets

Run `pnpm secrets:setup` from `nix develop` to configure GitHub Actions secrets and variables through the GitHub CLI. See `automation/github-secrets/README.md`.

- Source repos need `BLOG_REPO_DISPATCH_TOKEN` to call `repository_dispatch` on this blog repo.
- The insight workflow uses `GH_REPO_INSIGHT_TOKEN` to list and pack source repos.
- The Cursor SDK backend requires `CURSOR_API_KEY`; `CURSOR_MODEL` is optional and defaults to `composer-2`.
- The insight workflow uses the blog repo `GITHUB_TOKEN` to open review issues in this repo.

The repo-insight workflow needs `contents: write` and `issues: write`; source repos only dispatch events and never receive generated issues.
No external phone-notification service is required because GitHub issues drive GitHub Mobile and GitHub notification inboxes.

## Repo Catalog

`data/repo-catalog.json` is an overlay, not the source of truth. Repos not present in the catalog can still be selected from GitHub with safe defaults.

Use catalog entries for:

- disabling repos
- `safeToQuote`
- pack byte/file limits
- ignore patterns
- `localPath` override
- writing themes
- fork inclusion

Packing-related environment knobs:

- `REPO_INSIGHT_REPO_LIMIT`, default `5`
- `REPO_INSIGHT_MAX_PACK_BYTES`, default `200000`
- `REPO_INSIGHT_PACK_STYLE`, default `xml`

Compacted ProjectCapsules are cached under `.cache/repo-insight/capsules`. Raw Repomix packs and cloned repos stay temporary and are not cached.

Author and writing context is configured in `data/repo-insight-context.json`. Missing configured `../career-ops` files warn and skip. Generated `career-ops` outputs, reports, job descriptions, private tracker data, PDFs, and CV HTML/PDF outputs are not ingested.

## Adding A Source Repo

1. Copy `automation/repo-insight/workflows/source-repo-notify-template.yml` into the source repo and set `BLOG_REPO`.
2. Add `BLOG_REPO_DISPATCH_TOKEN` in the source repo.
3. Optionally add a catalog overlay for repo-specific settings.
4. Set `safeToQuote: true` only when short source excerpts are allowed in prompts/artifacts.

## Generated Insights

Generated MDX lands under `content/insights/runs/` and is indexed by `content/insights/index.json`. After writing an artifact, the generator opens or reuses a blog repo issue labeled `repo-insight`, `blog-candidate`, and `generated`.

To promote an insight, manually turn it into a polished post under `content/posts/` and intentionally update the profile navigation assignment in `lib/profileNavigation.ts`.

## Workflows

Run `pnpm automation:generate-workflows` after changing `automation/repo-insight/workflows/definitions.ts`. The generated YAML is committed so workflow behavior is reviewable, while `pnpm automation:check-workflows` prevents drift.
