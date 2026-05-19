# Blog

A custom blog built with Next.js and MDX.

This is where I publish technical writing. It’s intentionally minimal and built from scratch rather than using a template or CMS.

---

## Stack

- Next.js (App Router)
- MDX (server-rendered)
- rehype-highlight for code blocks
- Framer Motion for small UI transitions
- Playwright for basic layout checks
- Nix for a reproducible dev environment (includes **Bun** and Node for tooling)
- **Bun** for dependency install and **`bun.lock`** (use `bun install`; CI uses `bun install --frozen-lockfile`)
- Nx for task orchestration (`nx run blog:dev-app`, `nx run workspace:ci`, etc.; the Next app is under `apps/blog/`).

---

## Features

### MDX Posts

Posts live in:

```
content/posts/*.mdx
```

They’re rendered server-side using `next-mdx-remote`.  
Metadata is parsed with `gray-matter`.

### Static Mermaid Diagrams

Mermaid diagrams are compiled to SVG at build time using `mmdc`.

There’s no client-side Mermaid runtime — diagrams are static assets.

### Static Rendering

Blog pages are fully static:

```ts
export const dynamic = "force-static";
export const revalidate = false;
```

No runtime revalidation.

### Basic Layout Tests

Playwright tests check things like:

- No horizontal overflow
- Mobile navbar behavior
- SVG visibility across breakpoints

Nothing over-engineered — just guardrails.

---

## Development

Enter the dev shell:

```bash
nix develop
```

Start the dev server (**`nx run blog:dev-app`** runs **`next dev --turbo`** in **`apps/blog`** so Turbopack is always used for local dev; use **`bun run dev:webpack`** if you need the webpack dev bundler):

```bash
bun run dev
```

To pass extra Next.js CLI flags after `--turbo`:

```bash
bunx nx run blog:dev-app -- --port 3001
```

**Panda CSS:** `prepare` / `prebuild` run **`panda cssgen`**, which emits `styled-system/styles.css`. That file is imported from `apps/blog/app/globals.css`, so atomic utilities (e.g. `.c_white` on `<html>` from `RootLayout`) have real rules in the browser. Without it, you can see Panda class names in the DOM but **no styling**.

After **`nix develop`**, install deps once with **`bun install`** at the repo root. Then use **Nx** for day-to-day tasks.

Nx does **not** cache `next dev` — it mostly orchestrates `build`, `test`, and library tasks. For admin pages, **narrow imports** from `public-proof-db/*` subpaths keep the compile graph smaller than importing the package barrel.

Run layout tests:

```bash
bun test
```

which runs **`nx run workspace:e2e`**. Chromium comes from the flake (`playwright-driver.browsers`), not from `playwright install`. Run e2e inside **`nix develop`** so `PLAYWRIGHT_BROWSERS_PATH` matches nixpkgs. `@playwright/test` is pinned via **`package.json` overrides** to keep Playwright’s expected Chromium **revision** aligned with nixpkgs; after `nix flake update`, bump Playwright only if the new `playwright-driver` matches (or refresh the pins together).

---

## Why Custom?

I wanted:

- Full control over layout and styling
- First-class MDX support
- Static rendering
- No dependency on a hosted CMS

It’s a small, personal publishing engine.
