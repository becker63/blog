### PublicProof — local env (Vercel Postgres)

**Roadmap checklist**: **[`docs/public-proof-roadmap-checklist.md`](./public-proof-roadmap-checklist.md)**. **Shell CLIs / `.env.local`**: **[`docs/public-proof-local-dev.md`](./public-proof-local-dev.md)**.

**Blog + MDX**: unchanged; canonical posts live under `content/posts/`.

**Postgres operational state**:

- `POSTGRES_URL` (or `DATABASE_URL`) — Drizzle (`packages/public-proof-db`) + Next admin lists.
- `POSTGRES_URL_NON_POOLING` — preferred for `packages/public-proof-db` migrations.

**Secrets**:

- `PUBLIC_PROOF_BASE_URL` — canonical site origin (fallback `https://www.becker63.digital`).
- `PUBLIC_PROOF_ADMIN_SECRET` — v1 cookie auth for `/admin` (set in Vercel env).
- `PUBLIC_PROOF_ENCRYPTION_KEY` — base64-encoded 32-byte key for OAuth payload encryption (**required** before storing tokens).
- `CRON_SECRET` — authorize `/api/cron/public-proof/*` via `Authorization: Bearer …` or `x-cron-secret`.

**Fixture import** (needs matching MDX at `content/posts/<postSlug>.mdx`):

```bash
bunx nx run public-proof-cli:import-launch --launch=searchbench-100x
bunx nx run public-proof-cli:import-launch --configuration=persist --launch=searchbench-100x
```

**Migrations**: `bun run public-proof:db:generate` then `bun run public-proof:db:migrate` with Postgres env configured.
