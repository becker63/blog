# Agent notes (this repo)

## Monorepo / Nx

- The Next.js site lives under **`apps/blog/`** (Option A layout). Use **`bun install`** once for dependencies (from repo root; CI uses **`bun install --frozen-lockfile`**). **Nx** is the primary task runner (`nx run …` or **`bunx nx run …`**).
- **Dev:** `nx run blog:dev-app` → `next dev --turbo` in **`apps/blog`** (from `apps/blog/project.json`).
- **Production build:** `nx run blog:build-app`.
- **Full CI-style pipeline:** `nx run workspace:ci` (public-proof checks, blog build, root `tsc`).
- **Automation tools** live in **`packages/automation/`**; run targets such as `nx run automation:insight-check`.

### Pre-commit (from `nix develop`)

Enter **`nix develop`** so git-hooks installs **pre-commit**. With **`node_modules`** present after **`bun install`**, commits run **`tsc --noEmit -p tsconfig.json`** (same as **`nx run workspace:typecheck`**) then **`nx run workspace:lint`**, plus YAML and whitespace hooks from **`flake.nix`**. Regenerate the hook config only by changing the flake / re-entering the shell; **`.pre-commit-config.yaml`** is gitignored.

## Styling and layout

Read **`docs/ui-contract.md`** before adding or changing UI. The site uses **Panda CSS** (`panda.config.ts` at repo root, generated `styled-system/`) and shared React primitives under **`apps/blog/app/components/shared/`**. ESLint flat configs live under **`eslint/config/`** (see `eslint/config/README.md`).

### Required checks

- **`nx run workspace:lint`** — must pass (includes enforced style-system ESLint on `apps/blog/app/**`).
- **`nx run workspace:lint-admin`** — required when touching **`apps/blog/app/admin/**`** or **`apps/blog/app/components/admin/**`**.
- **`nx run workspace:typecheck`** — before concluding a change.
- **`nx run workspace:ci`** — optional full pipeline before large changes.

### Do not

- Introduce a second status/nav chrome: use **`SiteStatusBar`** with **`mode`** + **`row`** only; never set **`layerStyle: "navbar"`** outside `SiteStatusBar.tsx`.
- Duplicate pane column stacks in raw `css()`; use **`PaneParent`** or the **`paneParent`** recipe (`styled-system/recipes`).
- Put **`gap: "6"`** on **broad** route/page stacks. **Broad parents** use **`layout`**; **`AdminPageSections`** = `PaneParent` **`gap="layout"`**. Stack multiple **`AdminPanel`**s with **`AdminPanelStack`** (one column) or **`AdminPanelGrid`** (two columns **`lg+`** on dashboards). Route output lives under **`AdminMain`** in **`apps/blog/app/admin/(private)/layout.tsx`**.

### Spacing hierarchy (read `docs/ui-contract.md`)

- **Broad** containers → **`gap: "layout"`** (homepage grid / mobile stack, **`AdminPageSections`**).
- **Glass pane rows** → **`gap: "6"`** (**`AdminPanelStack`**, **`AdminPanelGrid`**, default **`PaneParent`** for search/category panes).
