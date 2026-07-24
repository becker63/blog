# Repo Insight Automation

This subsystem turns recent repository activity into GitHub issues for writing curation.

Repo Insight has one durable output: GitHub issues. The repository does not accumulate generated draft bundles; issues are the review queue, lifecycle, comment thread, label surface, and aggregation input.

## Architecture

- `cli/generate-insight.ts` is the product command.
- `adapters/github-repos.ts` asks GitHub for accessible repos. Recent push activity wakes the system up, but it does not decide the final topic.
- `packing/` samples eligible repos, checks them out into temporary directories, packs them with Repomix, and compacts those packs into project capsules.
- `context/` reads `content/automation/repo-insight-context.json`, summarizes local writing plus configured `../career-ops` writing/profile sources, and caches only typed context capsules.
- `adapters/` keeps Cursor SDK, GitHub repo discovery, and GitHub issue publishing isolated.
- GitHub issues in this blog repo are the canonical store and review inbox for generated insights.

## Commands

Run from the repo root with **Nx** (after **`bun install`**):

- `bunx nx run automation:generate-insight`
- `bunx nx run automation:generate-insight-force-ci` (CI/force path; see target definitions in `packages/automation/project.json`)
- `bunx nx run automation:aggregate-insights` — append `-- --dry-run` for a dry run when the CLI supports it
- `bunx nx run automation:insight-taste-profile`
- `bunx nx run automation:insight-check`
- `bunx nx run automation:insight-budget`

Use `nix develop` for the reproducible tool environment. **Nx targets** in `packages/automation/project.json` are the command surface.
Repomix is provided by the Nix dev shell and is invoked with `--compress`; pack files stay in OS temp directories and are not committed.

`bunx nx run automation:generate-insight` does not require a payload. Each invocation polls GitHub for accessible repository changes; it does not use source-repository webhooks.

Poll state is stored in `content/automation/repo-insight-poll-state.json`. Normal runs skip Repomix and Cursor when no accessible repo has a new `pushedAt` value. Once a run wakes up, repo selection is stochastic by default. The latest commit is not automatically the focus. Cursor output is schema-validated. Near-miss JSON gets one schema repair attempt. Force mode samples uniformly too, requires one issue draft, and requires one created or reused GitHub issue. `no_insight` is invalid in force mode.

Budget state is stored in `content/automation/repo-insight-budget-state.json`. Repo Insight is designed to preserve Cursor for interactive coding first. No-change producer runs exit before spending budget.

## Environment

Provide credentials in the shell when running the commands:

- `GH_REPO_INSIGHT_TOKEN` lists and packs source repos.
- The Cursor SDK backend requires `CURSOR_API_KEY`; `CURSOR_MODEL` is optional and defaults to `composer-2`.
- `GITHUB_TOKEN` or `GH_TOKEN` opens and reads review issues in the blog repo.

The GitHub tokens need read access to source repositories and write access to issues in the blog repo.
No external phone-notification service is required because GitHub issues drive GitHub Mobile and GitHub notification inboxes.

## Repo Catalog

`content/automation/repo-catalog.json` is an overlay, not the source of truth. Repos not present in the catalog can still be selected from GitHub with safe defaults.

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

Author and writing context is configured in `content/automation/repo-insight-context.json`. The approved `career-ops` writing/profile context is vendored under `content/authoring/repo-insight-context/career-ops/` so the automation can read it without a sibling checkout. Generated `career-ops` outputs, reports, job descriptions, private tracker data, PDFs, and CV HTML/PDF outputs are not ingested.

## Adding A Source Repo

1. Ensure `GH_REPO_INSIGHT_TOKEN` can read the repo.
2. Optionally add a catalog overlay for repo-specific settings.
3. Set `safeToQuote: true` only when short source excerpts are allowed in prompts and issue bodies.

## Generated Insights

The producer polls repository activity as a wake-up signal. If nothing changed, normal mode exits early before Cursor or Repomix work. If something changed, it builds a candidate pool from changed repos, recently active repos, and pinned catalog repos. It then samples repos uniformly by default and packs only that sampled context window. Runs pack 3 repos by default, cap each pack at about 100k bytes, and cap the total packed input at about 300k bytes.

The sampled repos are not a ranked list. They are context for the curator. The final Cursor prompt explicitly says not to assume the newest repo or newest commit is the most important signal. The agent chooses the issue topic based on conceptual interest, evidence strength, and fit with Taylor's broader body of work. If no sampled repo produces a strong idea, normal mode returns `no_insight`.

Use `bunx nx run automation:insight-budget` to inspect today's producer runs, aggregator runs, configured limits, last run timestamps, and approximate token totals. Token estimates are rough guardrails based on prompt/output characters, not exact billing.

To promote an insight, manually turn the issue into a polished post under `content/posts/` and intentionally update the profile navigation assignment in `lib/profileNavigation.ts`. A later promotion assistant could draft posts from issues, but issues remain the generated store.

## Aggregating Insights

`bunx nx run automation:aggregate-insights` clusters insight issues **with** the same durable context as the producer: **taste profile** (`buildTasteProfile({ write: false })`), **writing corpus capsule**, and **author profile capsule** (not raw source trees).

**Every successful run writes the rolling digest issue** (`Repo Insight Digest — Current Themes`, marker `<!-- repo-insight:digest=current-themes -->`). The model always returns an **InsightDigest** (JSON). When a batch is weak or duplicative, that judgment lives *inside* the digest (summary + clusters + `editorialDecisions`) — the issue is still updated so there is always a fresh editorial record.

**`--dry-run`** does not write budget state and uses a placeholder digest body unless **`CURSOR_API_KEY`** is set; with the key set, dry-run runs the real model but still does not publish (GitHub shows `dry-run`). **`--dry-run` without `CURSOR_API_KEY`** skips the model and publishes only a stub if you also omit tokens (typically you still need `GITHUB_TOKEN` / `GH_TOKEN` to list issues).

The digest body includes **`editorialDecisions`** (batch-level actions near the top) and per-cluster fields such as **`editorialDecision`**, **`whyThisIsOrIsNotInteresting`**, and **`profileConnection`**.

Aggregation skips when fewer than 2 non-digest insight issues exist. Scheduled-mode callers can additionally enforce the daily aggregator budget and the 20-hour digest rate limit.
