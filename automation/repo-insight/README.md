# Repo Insight Automation

This subsystem turns recent repository activity into GitHub issues for writing curation.

Repo Insight has one durable output: GitHub issues. The repository does not accumulate generated draft bundles; issues are the review queue, lifecycle, comment thread, label surface, and aggregation input.

## Architecture

- `cli/generate-insight.ts` is the product command.
- `adapters/github-repos.ts` asks GitHub for accessible repos. Recent push activity wakes the system up, but it does not decide the final topic.
- `packing/` samples eligible repos, checks them out into temporary directories, packs them with Repomix, and compacts those packs into project capsules.
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
- `pnpm insight:budget`
- `pnpm automation:generate-workflows`
- `pnpm automation:check-workflows`
- `pnpm automation:actionlint`

Use `nix develop` for the reproducible tool environment. Package scripts remain the command surface.
Repomix is provided by the Nix dev shell and is invoked with `--compress`; pack files stay in OS temp directories and are not committed.

`pnpm generate-insight` does not require a payload. Repo Insight uses scheduled polling from the blog repo, not source repo webhooks. No per-repo workflow installation is required.

Poll state is stored in `data/repo-insight-poll-state.json`. Normal scheduled runs skip Repomix and Cursor when no accessible repo has a new `pushedAt` value. Once a run wakes up, repo selection is stochastic by default. The latest commit is not automatically the focus. Cursor output is schema-validated. Near-miss JSON gets one schema repair attempt. Force mode samples uniformly too, requires one issue draft, and requires one created or reused GitHub issue. `no_insight` is invalid in force mode.

Budget state is stored in `data/repo-insight-budget-state.json`. Repo Insight is designed to preserve Cursor for interactive coding first. Scheduled automation is opportunistic and cheap: normal scheduled producer runs are capped at 4 Cursor-backed runs per UTC day, and the daily aggregator is capped at 1 Cursor-backed run per UTC day. No-change producer wakeups exit before spending budget.

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
- `pinned` to keep a repo in the candidate pool

Packing-related environment knobs:

- `REPO_INSIGHT_SELECTED_REPO_LIMIT`, default `3`
- `REPO_INSIGHT_CANDIDATE_LIMIT`, default `25`
- `REPO_INSIGHT_SELECTION_MODE`, default `uniform`
- `REPO_INSIGHT_RANDOM_SEED`, optional deterministic selection seed
- `REPO_INSIGHT_MAX_PACK_BYTES`, default `100000`
- `REPO_INSIGHT_MAX_TOTAL_PACK_BYTES`, default `300000`
- `REPO_INSIGHT_MAX_NEW_COMPACTIONS_PER_RUN`, default `2` for scheduled producer runs
- `REPO_INSIGHT_PACK_STYLE`, default `xml`

Budget-related environment knobs:

- `REPO_INSIGHT_PRODUCER_DAILY_LIMIT`, default `4`
- `REPO_INSIGHT_AGGREGATOR_DAILY_LIMIT`, default `1`
- `REPO_INSIGHT_AGGREGATOR_MAX_SEEDS`, default `30`
- `REPO_INSIGHT_DISABLE_BUDGET`, default `false`

Compacted ProjectCapsules are cached under `.cache/repo-insight/capsules`. Raw Repomix packs and cloned repos stay temporary and are not cached.

Author and writing context is configured in `data/repo-insight-context.json`. The approved `career-ops` writing/profile context is vendored under `data/repo-insight-context/career-ops/` so GitHub Actions can read it without a sibling checkout. Generated `career-ops` outputs, reports, job descriptions, private tracker data, PDFs, and CV HTML/PDF outputs are not ingested.

## Adding A Source Repo

1. Ensure `GH_REPO_INSIGHT_TOKEN` can read the repo.
2. Optionally add a catalog overlay for repo-specific settings.
3. Set `safeToQuote: true` only when short source excerpts are allowed in prompts and issue bodies.

## Generated Insights

The producer uses scheduled polling as a wake-up signal. If nothing changed, normal mode exits early before Cursor or Repomix work. If the daily scheduled budget is exhausted, it also exits before Cursor. If something changed and budget remains, it builds a candidate pool from changed repos, recently active repos, and pinned catalog repos. It then samples repos uniformly by default and packs only that sampled context window. Scheduled runs pack 3 repos by default, cap each pack at about 100k bytes, and cap the total packed input at about 300k bytes.

The sampled repos are not a ranked list. They are context for the curator. The final Cursor prompt explicitly says not to assume the newest repo or newest commit is the most important signal. The agent chooses the issue topic based on conceptual interest, evidence strength, and fit with Taylor's broader body of work. If no sampled repo produces a strong idea, normal mode returns `no_insight`.

Use `pnpm insight:budget` to inspect today's producer runs, aggregator runs, configured limits, last run timestamps, and approximate token totals. Token estimates are rough guardrails based on prompt/output characters, not exact billing.

To promote an insight, manually turn the issue into a polished post under `content/posts/` and intentionally update the profile navigation assignment in `lib/profileNavigation.ts`. A later promotion assistant could draft posts from issues, but issues remain the generated store.

## Aggregating Insights

`pnpm aggregate-insights` clusters insight issues **with** the same durable context as the producer: **taste profile** (`buildTasteProfile({ write: false })`), **writing corpus capsule**, and **author profile capsule** (not raw source trees). Seeds alone are insufficient for editorial judgment against Taylor’s corpus.

The aggregator first asks Cursor for an **`AggregateDecision`**: **`kind: "digest"`** (publish a digest) or **`kind: "no_digest_update"`** (skip updating the rolling issue when the batch is weak, duplicative, or too self‑referential). **Scheduled CI** honors `no_digest_update` and leaves the rolling digest untouched; **`--dry-run`** prints the outcome without publishing and **does not write budget state** (even though a local dry-run **with `CURSOR_API_KEY`** runs the editorial model).

`pnpm aggregate-insights:dry-run` **without** `CURSOR_API_KEY` skips the model and exits with **`no_digest_update`** explaining that the key was unset --- use that for cheap seed/GitHub sanity checks only; set `CURSOR_API_KEY` locally to preview the editorial gate without publishing.

The rolling digest issue is **`Repo Insight Digest — Current Themes`**, keyed by `<!-- repo-insight:digest=current-themes -->`, labeled `repo-insight`, `repo-insight-digest`, `generated`, and `editorial`. Structured output includes **`editorialDecisions`** (batch-level merges/closes/waits near the top) and per-cluster **editorial judgments** (`editorialDecision`, `whyThisIsOrIsNotInteresting`, `profileConnection`, etc.).

Scheduled aggregation still skips when fewer than 2 non-digest insight issues exist, when the daily aggregator budget is exhausted, or when the digest was updated less than 20 hours ago.

## Workflows

Run `pnpm automation:generate-workflows` after changing `automation/repo-insight/workflows/definitions.ts`. The generated YAML is committed so workflow behavior is reviewable, while `pnpm automation:check-workflows` prevents drift.

`repo-insight.yml` runs hourly on schedule (`17 * * * *`) and can also be started manually (`workflow_dispatch` with optional `force=true`). Cron only polls GitHub for `pushedAt` changes (wake signal). Scheduled runs bail out before Cursor when nothing changed. Manual force skips that gate and bypasses producer **scheduled quota** (runs count as manual in budget state); use `--ignore-budget` locally only when you deliberately want runs without budget bookkeeping.
