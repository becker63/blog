# ESLint flat configs

This folder holds **flat config** files consumed via `--config` in `project.json` workspace lint targets:

- **`style-system.mjs`** — blog app style firewall (`apps/blog/app/**`) used by `nx run workspace:lint`.
- **`public-proof-admin.mjs`** — admin-only rules for `/admin` and admin components; used by `nx run workspace:lint-admin`.

Shared custom rules live in `eslint/style-firewall.mjs` (repo root `eslint/`).
