# UI style contract (blog + admin)

This project **does not** style ad-hoc status bars, navbar chrome, or pane column stacks. ESLint (`eslint/config/style-system.mjs`) enforces the rules below; run `bun run lint` and `bun run lint:admin`.

## Spacing hierarchy (critical)

**Broad content parents** use **small** gaps (`spacing.layout` → Panda `gap: "layout"`). **Nested glass tiles** (panes, cards, admin panels) use **large** gaps (`gap: "6"` / 24px) and sit **above** the flat shell (`position: "relative"`, `zIndex: 1` on `PaneChild`, `glass*Styles`, **`layerStyle: "adminPanel"`**).

| Layer | Gap | Examples |
|-------|-----|------------|
| Broad parent | **`layout`** (~12px) | Homepage desktop `data-broad-content-grid` (`gridGap: "layout"`). Mobile `data-broad-content-stack` (`gap: "layout"`). **`AdminPageSections`** (`PaneParent gap="layout"`) between back link, sub-nav, and content. |
| Glass pane rows | **`6`** (~24px) | **`AdminPanelStack`** or **`AdminPanelGrid`** (`gap: "6"`). **`PaneParent`** default **`gap="6"`** for search/category **`PaneChild`** stacks. |

Do **not** use **`gap: "6"`** on the **outer** admin route stack (that duplicates homepage “big gap between everything”). Use **`AdminPageSections`** (tight) + **`AdminPanelStack`** or **`AdminPanelGrid`** (wide) when you have multiple panels.

## Status bar (single shared chrome)

- Use **`SiteStatusBar`** from `app/components/shared/SiteStatusBar.tsx` with **`mode`** and **`row`**. Do not pass **`variant`**.
- Panda **`layerStyle: "navbar"`** is allowed **only** inside `SiteStatusBar.tsx`. Use `<SiteStatusBar …>` everywhere else.

## Page / admin shells

Use Panda **`layerStyle`** tokens from `panda.config.ts`, for example:

- **`pageContainer`** — top padding under the fixed status bar.
- **`pageWithMargins`** — full page with margins.
- **`adminShell`** — flex **column** filling the viewport width (`maxW` ~1180px): stacks **`AdminBrandBar`** + **`AdminMain`** (route output). No decorative backgrounds — layout only.
- **`adminPanel`** — default glass panel surface for **`AdminPanel`** / **`AdminAuthPanel`**.

Do not fork duplicate glass shells; extend shared UI under `app/components/shared/` or `app/components/admin/ui/` when a new surface is needed.

## Panes (glass tiles + vertical rhythm)

- **Pane tiles**: **`PaneChild`** (or **`paneChildSurfaceStyles`** / **`Aside`**). Surfaces float above the parent via **`zIndex`** in shared styles.
- **Stacks**: **`PaneParent`** + Panda **`paneParent`** recipe. **`gap: "layout"`** = broad parents; **`gap: "6"`** = pane groups.

Do not copy-paste **`css({ display: "flex", flexDirection: "column", w: "full", gap: … })`** — ESLint **`prefer-pane-parent-duplicate-stack`** rejects the `6` fingerprint outside the canonical implementation.

## Admin private routes (`app/admin/(private)/**/page.tsx`)

- **Layout** — `app/admin/(private)/layout.tsx` wraps routes in **`AdminShell`** → **`AdminBrandBar`** → **`AdminMain`** (`data-admin-main`). Pages render **inside** the main region only.
- **Do not** return a root **`<>...</>`** fragment — **`style-firewall/admin-private-page-no-root-fragment`**.
- **`AdminPageSections`** — **`PaneParent gap="layout"`**: back link, **`AdminSubNav`**, then content. **Tight** vertical rhythm between those **blocks**.
- **`AdminPanelStack`** — **one column** of **`AdminPanel`**s (`gap: "6"`).
- **`AdminPanelGrid`** — **two columns from `lg`** for dashboard-style pages (e.g. **`/`** overview); same **`gap: "6"`** as stacks.
- **`breadcrumbNav`** / **`subNav`**: **`mb: "0"`**; outer stack supplies spacing.

## Verification

- **`bun run lint`** — Next + style-system rules on `app/**`.
- **`bun run lint:admin`** — admin firewall.
- **`bun run test:blog-spacing-contract`** — Playwright spacing contract for the blog shell.
