# Repo Insight Automation

This subsystem turns recent repository activity into GitHub issues for writing curation.

Repo Insight has one durable output: GitHub issues. The repository does not accumulate generated draft bundles; issues are the review queue, lifecycle, comment thread, label surface, and aggregation input.

## Architecture

- `cli/generate-insight.ts` is the product command.
- `adapters/github-repos.ts` asks GitHub for accessible repos sorted by recent push activity.
- `packing/` checks out the top repos into temporary directories, packs them with Repomix, and compacts those packs into project capsules.
- `context/` reads `data/repo-insight-context.json`, summarizes local writing plus configured `../career-ops` writing/profile sources, and caches only typed context capsules.
- `adapters/` keeps Cursor SDK, GitHub repo discovery, and GitHub issue publishing isolated.
- GitHub issues in this blog repo are the canonical store and review inbox for generated insights.
- `workflows/definitions.ts` is the source of truth for generated GitHub Actions YAML.

## Commands

- `pnpm generate-insight`
- `pnpm generate-insight:force`
- `pnpm aggregate-insights`
- `pnpm aggregate-insights:dry-run`
- `pnpm insight:taste-profile`
- `pnpm insight:check`
- `pnpm automation:generate-workflows`
- `pnpm automation:check-workflows`
- `pnpm automation:actionlint`

Use `nix develop` for the reproducible tool environment. Package scripts remain the command surface.
Repomix is provided by the Nix dev shell and is invoked with `--compress`; pack files stay in OS temp directories and are not committed.

`pnpm generate-insight` does not require a payload. Repo Insight uses scheduled polling from the blog repo, not source repo webhooks. No per-repo workflow installation is required.

Poll state is stored in `data/repo-insight-poll-state.json`. Normal scheduled runs skip Repomix and Cursor when no selected repos have a new `pushedAt` value. Cursor output is schema-validated. Near-miss JSON gets one schema repair attempt. Force mode requires one issue draft and one created or reused GitHub issue. `no_insight` is invalid in force mode.

## Secrets

Run `pnpm secrets:setup` from `nix develop` to configure GitHub Actions secrets and variables through the GitHub CLI. See `automation/github-secrets/README.md`.

- The insight workflow uses `GH_REPO_INSIGHT_TOKEN` to list and pack source repos.
- The Cursor SDK backend requires `CURSOR_API_KEY`; `CURSOR_MODEL` is optional and defaults to `composer-2`.
- The insight workflow uses the blog repo `GITHUB_TOKEN` to open review issues in this repo.

The repo-insight workflow needs `contents: write` and `issues: write`; source repos do not need workflows or secrets and never receive generated issues.
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

Author and writing context is configured in `data/repo-insight-context.json`. The approved `career-ops` writing/profile context is vendored under `data/repo-insight-context/career-ops/` so GitHub Actions can read it without a sibling checkout. Generated `career-ops` outputs, reports, job descriptions, private tracker data, PDFs, and CV HTML/PDF outputs are not ingested.

## Adding A Source Repo

1. Ensure `GH_REPO_INSIGHT_TOKEN` can read the repo.
2. Optionally add a catalog overlay for repo-specific settings.
3. Set `safeToQuote: true` only when short source excerpts are allowed in prompts and issue bodies.

## Generated Insights

The producer uses scheduled polling to find recent repo activity, packs selected repos, asks Cursor whether there is an insight, and creates or reuses a blog repo issue labeled `repo-insight`, `blog-candidate`, and `generated`. If no insight is worth keeping, it updates poll state and exits without writing a draft.

To promote an insight, manually turn the issue into a polished post under `content/posts/` and intentionally update the profile navigation assignment in `lib/profileNavigation.ts`. A later promotion assistant could draft posts from issues, but issues remain the generated store.

## Aggregating Insights

`pnpm aggregate-insights` is a second-order editor. It reads existing blog repo issues labeled `repo-insight`, clusters recurring conceptual themes with Cursor, and creates or updates one rolling issue titled `Repo Insight Digest — Current Themes`.

The rolling digest issue is identified by `<!-- repo-insight:digest=current-themes -->` and labeled `repo-insight`, `repo-insight-digest`, `generated`, and `editorial`. The aggregator excludes that digest issue from future input so it does not summarize itself. Use `pnpm aggregate-insights:dry-run` to verify seed collection and issue rendering without updating GitHub.

## Workflows

Run `pnpm automation:generate-workflows` after changing `automation/repo-insight/workflows/definitions.ts`. The generated YAML is committed so workflow behavior is reviewable, while `pnpm automation:check-workflows` prevents drift.

`repo-insight.yml` runs on the blog repo schedule (`17 * * * *`) and can also be started manually with `workflow_dispatch`. The cron wakeup polls GitHub using `GH_REPO_INSIGHT_TOKEN`, compares selected repos against `data/repo-insight-poll-state.json`, and skips expensive model calls when nothing changed. Manual force runs ignore that no-change gate.
