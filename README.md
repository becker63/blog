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
- Nix for a reproducible dev environment

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

Start the dev server:

```bash
pnpm dev
```

Run layout tests:

```bash
pnpm test
```

---

## Why Custom?

I wanted:

- Full control over layout and styling
- First-class MDX support
- Static rendering
- No dependency on a hosted CMS

It’s a small, personal publishing engine.
