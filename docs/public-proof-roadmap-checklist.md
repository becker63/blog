# PublicProof / Hermes roadmap — local checklist

Check boxes as you finish items. Aligns with the consolidated Hermes long-session prompt unless noted.

_Last updated: check git history._

## Phase 0 — Environment & Postgres bootstrap

- [x] Neon Postgres provisioned on Vercel (prod/preview/dev)
- [x] `POSTGRES_URL` / `POSTGRES_URL_NON_POOLING` present in `.env.local` locally
- [x] Initial Drizzle migration applied (`packages/public-proof-db/drizzle/`)
- [x] `bun run public-proof:db:check` succeeds against Neon
- [x] **`0001_fixed_rawhide_kid.sql` (`launch_reports`)** applied in dev/local (`bun run public-proof:db:migrate:local`)

## Phase 0b — Repo hygiene / footguns

- [x] **CLI ergonomics**: document + scripts so shell CLIs load `.env.local` (see `docs/public-proof-local-dev.md`)
- [x] **`public-proof-jobs`**: Nx `check` target surfaces real `tsc` failures (no `|| true`)
- [x] Root `bun run public-proof:check` runs **jobs + core:test** (`nx graph` unaffected)
- [x] Sweep **`packages/**/project.json`** for suppressed failures — only **`public-proof-jobs`** required a fix

## Phase A — Panda / SAT-style discipline

- [x] **Scoped firewall**: `bun run lint:admin` (flat ESLint · `eslint/config/public-proof-admin.mjs`; raw color/shadow helpers on `/app/admin`)
- [ ] Style-firewall on full **`bun run lint`** / whole app (defer — still `next lint`)
- [ ] Admin recipes backlog: **adminTable**, **adminTimeline**, **adminTracePanel**, **adminJobStatusCard**, primitives (**Button**, **Badge**, …)
- [x] **`/admin` overview**: basic aggregates (running jobs, failed/partial jobs, proposed plan items, unread notifications)

## Phase B — DB query layer & audit spine

- [x] **`insertAuditLog`** in `packages/public-proof-db/queries/audit-log.ts` + exported
- [x] **`listRecentAuditLogs`** (+ read helpers for launch post jobs, scheduled_jobs — see `queries/*.ts`)
- [ ] **`queries/`** (deepest backlog): approvals write-paths beyond plan items; publications ingestion; richer posting job lifecycle mutations; **`sync_metrics`** real fetchers + notification emitter helpers tied to milestones
  - Done in this checkpoint: drafts/plan/community lookups, **`insertManualMetricSnapshotRow`**, **`launch_reports`** read/write helpers, **`listLaunchesWithAdminCounts`**, **`compileLaunchReportMarkdown`**, notification insert/query
- [x] **Input Zod + parsers** — manual metrics form (`manualMetricSnapshotFormSchema`, `parseOptionalNonNegativeInt` in `packages/public-proof-core`)
- [ ] **`audit_log` on all dangerous mutations** (expand from milestone actions)
- [ ] Align job/item status strings & **`launch_post_job_events.event_type`** vocabulary with Hermes prompt (migrate if drift)

## Phase C — Launch admin (read → write)

- [x] **`/admin/launches/[slug]`**: audience gate **Server Action** (`updateLaunchAudienceGate`) + audit row
- [x] **Gate UX**: short risk/disposition copy tying matrix to deterministic enforcement
- [x] **`/admin/launches`** list with **destination counts** + active job counts (`listLaunchesWithAdminCounts`)
- [x] **`/admin/audit`** (read-only audit tail)
- [x] **`/admin/launches/[slug]/drafts`** (read-only)
- [x] **`/admin/launches/[slug]/posting-plan`** (approve/reject proposed items + audit + Agents cross-link copy)
- [x] **`/admin/launches/[slug]/jobs`** + **`/[jobId]`** (items + timeline; live polling later)
- [x] **`/admin/launches/[slug]/metrics`** (snapshots table + **manual snapshot form & audit**) + rollup sums via `sumPartialMetrics`
- [x] **`/admin/launches/[slug]/report`** (renders **`launch_reports` timeline** sourced from Postgres)
- [x] **`/admin/notifications`** (read list), **`/admin/accounts`**, **`/admin/settings`** (global admin routes from Hermes map)

## Phase D — Dashboard-first jobs vertical

- [x] Minimal **posting job** Server Actions: **dry-run create** + **queue draft** (+ audit via `lib/admin/job-actions.ts`)
- [ ] Full Server Actions palette: intelligence generation (`generateDrafts/generatePostingPlan`), **structured `create job`** (`awaiting_approval` → **confirm sheet** → **queue**), cancel/retry/manual complete UX
- [x] **Plan item approvals** (`proposed → approved/rejected`) + audits (`plan-actions`)
- [x] Lightweight **confirmation affordances**: queue actions log notifications + auditing; exhaustive destination summary modal still pending
- [ ] Harden **`public-proof-jobs` executor**: deeper gate/draft match vs Hermes (**partial**: idempotent skip when URL/platform IDs already stamped on pending items)
- [x] **`scheduled_jobs`**: posting executor enqueues **`render_report`** (deferred) + **`sync_metrics`** (+1h after real publish); crons bounded
- [ ] **`sync_metrics`** worker persisting authoritative API pulls (beyond manual entry + stubs)
- [ ] **`scheduled_jobs`**: richer dashboard producers beyond posting-completion paths

## Phase E — Agent traces in product

- [x] **`/admin/launches/[slug]/agents`** (trace list from `agent_trace_runs`)
- [x] **`/admin/launches/[slug]/agents/[traceRunId]`** (artifacts + timeline)
- [x] **Cross-links** wherever metadata allows (**posting-plan** → Agents breadcrumb reminder; deeper FK-backed links still TODO when schema threads `trace_run_id`)

### Agent task inventory (Hermes prompts)

- [ ] `analyzeAuthorProfileForDistribution`
- [ ] `discoverCandidateCommunities`
- [ ] `analyzeCommunitySentiment`
- [ ] **`rankCommunityTargets`** (beyond current Reddit-focused rank)
- [ ] `generateCommunityDrafts`
- [ ] `generatePostingPlan`
- [ ] `generateLaunchReportSummary`
- [ ] `summarizeEngagementAfterPosting`

*(Existing partly: summarize post, variants, Reddit ranker, resume bullets — keep.)*

## Phase F — Cron & analytics

- [x] **`/api/cron/public-proof/sync-metrics`**: bounded batch over **`scheduled_jobs`** (**placeholder finalize** until provider pulls land)
- [x] **`/api/cron/public-proof/render-reports`**: compiles Markdown via **`compileLaunchReportMarkdown`** + persists **`launch_reports`** + acknowledges `scheduled_jobs`
- [x] **Manual metric entry** admin form + **`metric_snapshot_manual_written`** audits
- [x] **Normalize rollup helper** (`sumPartialMetrics` / `ZERO_METRICS` in **`public-proof-core`**; reporting package unchanged)
- [ ] Wire aggregated totals into richer `/admin` dashboards + **`public-proof-reporting`** consumption

## Phase G — Notifications & mobile

- [x] Persist **`notification_events`** for major posting milestones (**queued/start/final**) + backlog for others
- [x] **`apps/mobile`** documentation stub (`apps/mobile/README.md`, `package.json` placeholder starter)
- [x] **`/api/public-proof/mobile/register-device`**, **`/notifications`**, **`/approve`**, **`/reject`** (typed `501` stubs — roadmap parity with Hermes filenames)

## Phase H — CLI parity (`bunx nx` / `bun run public-proof:*`)

- [x] **`community-plan`** Nx alias → existing Reddit planner (`bun run public-proof:community-plan -- --launch=<id>` delegates to **`nx run public-proof-cli:community-plan`**)
- [x] **`job-status`** introspection CLI (`bun run public-proof:job-status -- --job=<uuid>`)
- [ ] `job:create`, `dry-run`, `queue`, `retry-item`, richer `sync` bridge (Hermes appendix still open)
- [ ] Naming parity with appendix in Hermes prompt (incremental)

## Phase K — Verification gates

- [ ] Broad Hermes matrices (gates already covered lightly; Cursor JSON wrappers, Reddit guards regression suite, cron auth unit tests …)
- [x] **`bun run lint:admin`** + **`bun run typecheck`** + **`bun run public-proof:check`** now includes **`public-proof-core:test`**
- [ ] **`bun run build`** unchanged guarantee (run before shipping)

---

## Session log (short)

| Date       | Notes |
|-----------|------|
| 2026-05-19 (am) | Roadmap checklist; jobs Nx `check` unfudged; `insertAuditLog` + gate Server Action; `public-proof:check` includes jobs; Phase 0b CLI (`docs/public-proof-local-dev.md`, dotenv wrappers). |
| 2026-05-19 (pm2) | Admin agent traces + jobs wiring; roadmap Phase E checkpoints; **`scheduled_jobs`** enqueue notes + render cron caveat. |
| 2026-05-19 (Hermes sprint) | Draft/posting-plan/metrics/report/notifs/accounts/settings routes + DB helpers. |
| **2026-05-19 (checkpoint impl)** | `launch_reports` migration + **`render_reports` persists MD**; **`insertManualMetricSnapshotRow`** & admin metric form (**`metric-actions`**); **`sumPartialMetrics`** + regression test; **notification emits** (`job-actions`, `posting-cron`), **executor idempotent guard** when URL/id already stamped; richer launch list aggregates; **`community-plan`** + **`job-status`** Nx/bun shortcuts; **`apps/mobile`** stub + REST parity stubs (`approve`/`reject`/`notifications`); metrics/report UI upgrades; roadmap refresh. |

When you merge work, extend the session log row.
