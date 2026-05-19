# PublicProof — local dev & shell CLIs

**Related**: [`public-proof-env.md`](./public-proof-env.md) (variable names), [`public-proof-roadmap-checklist.md`](./public-proof-roadmap-checklist.md).

## Why Next.js sees Postgres but `tsx` / `nx` do not

Next.js automatically loads env files from the **repository root** when you run `bun run dev`, `bun run build`, or route handlers:

- `.env`, `.env.local`, `.env.development`, `.env.development.local`, etc. (see [Next.js env docs](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables))

So admin routes and server code that call `process.env.POSTGRES_URL` work after you pull Vercel env into `.env.local`.

**Raw shell commands do not.** `nx run …`, `tsx packages/…`, and Drizzle scripts only see variables already exported in your shell. They never read `.env.local` unless you load it yourself.

## `.env.local` is local-only

- `.env.local` is **gitignored** — it is not in the repo.
- Create it on each machine with Vercel CLI, from the project root:

  ```bash
  bun run vercel:link    # once per clone
  bun run vercel:pull    # writes/updates .env.local with development env
  ```

- Expect `POSTGRES_URL`, `POSTGRES_URL_NON_POOLING`, and other PublicProof secrets described in [`public-proof-env.md`](./public-proof-env.md).

If `.env.local` is missing, the `:local` scripts below fail fast (dotenv-cli cannot open the file). That is intentional — fix by pulling env, not by committing secrets.

## Commands with env loaded (`:local` scripts)

Root `package.json` wraps Neon-dependent Nx targets with [dotenv-cli](https://www.npmjs.com/package/dotenv-cli). Failures from `nx`, Drizzle, or `tsx` still propagate (no `|| true`).

| Task | With `.env.local` loaded |
|------|---------------------------|
| DB connectivity check | `bun run public-proof:db:check:local` |
| Apply migrations | `bun run public-proof:db:migrate:local` |
| Demo seed (plan + snapshot + report + notification) | `bun run public-proof:seed-demo` |
| Drizzle Studio | `bun run public-proof:db:studio:local` |

These run the same Nx targets as the non-`:local` scripts (`public-proof:db:check`, `migrate`, `studio`) but prefix:

```text
dotenv -e .env.local --
```

## Fixture import (Postgres)

Import needs Postgres when using the **persist** configuration:

```bash
bun run public-proof:with-local-env -- nx run public-proof-cli:import-launch --configuration=persist --launch=<slug>
```

After `searchbench-100x` is imported, you can materialize illustrative rows (`posting_plans`, metrics, `launch_reports`, `notification_events`) with:

```bash
bun run public-proof:seed-demo
```

Dry-run import (no DB) does not need env:

```bash
bunx nx run public-proof-cli:import-launch --launch=<slug>
```

See [`public-proof-env.md`](./public-proof-env.md) for MDX path requirements.

## Reusable prefix: `public-proof:with-local-env`

For any other command that needs Vercel-pulled vars:

```bash
bun run public-proof:with-local-env -- nx run <project>:<target> [nx args…]
bun run public-proof:with-local-env -- tsx path/to/script.ts
```

Equivalent to `dotenv -e .env.local -- <your command>` from the repo root.

## Without the scripts

Manual equivalent:

```bash
dotenv -e .env.local -- bun run public-proof:db:check
dotenv -e .env.local -- bunx nx run public-proof-cli:import-launch --configuration=persist --launch=searchbench-100x
```

Or export vars in your shell session (not recommended for day-to-day; easy to leak into shell history).

## Admin UI lint (Hermes style firewall)

PublicProof ships a **scoped** ESLint flat config so `/app/admin` gets bans on raw colors / brittle surface styling **without** migrating the whole repo off `next lint` yet.

```bash
bun run lint:admin
```

Uses `eslint/config/public-proof-admin.mjs` (`ESLINT_USE_FLAT_CONFIG=true` inside the script). Add to CI when ready.
