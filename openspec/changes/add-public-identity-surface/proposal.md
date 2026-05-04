## Why

The blog already demonstrates technical depth, but it does not yet explain the person or worldview tying the work together. Visitors can find strong material, yet the site still reads more like an archive of artifacts than a coherent public identity.

This change addresses two related gaps at once. The dashboard has room for one more meaningful panel that can compress the author's identity and areas of practice, and the search page needs a clearer structure so visitors understand why the work belongs together before they search for individual posts.

## What Changes

- Add a long-form "About Me" panel to the dashboard with a placeholder portrait area, concise identity sentence, short explanatory paragraph, and optional links into high-signal destinations.
- Keep the identity panel limited to a dashboard preview and existing destinations; do not add a dedicated `/about` route in this change.
- Restructure the search experience around two top-level parent categories:
  - `Security / Systems Work`
  - `Platform / Social Infrastructure Work`
- Add short blurbs for each parent category so the search page acts as an orientation surface as well as a lookup tool.
- Add support for parent category nodes with nested child entries in the search tree model.
- Fix search layout so results never scroll underneath the title card or search bar.
- Preserve the current aesthetic and avoid expanding this into a full redesign or generalized taxonomy system.
- Keep copy work central by drafting the identity-panel sentence/paragraph and the two category blurbs before final layout polish.
- Require explicit assignment of every published post to exactly one top-level profile category, or intentional exclusion with a documented reason.

## Capabilities

### New Capabilities
- `dashboard-identity-surface`: Adds a public-facing identity panel to the home dashboard with portrait placeholder support, compressed author framing, and links into stronger profile evidence.
- `search-profile-tree`: Adds two profile-oriented parent categories, nested child entries, and a structurally separated search result layout that works for browsing and direct lookup.

### Modified Capabilities
- None.

## Impact

- Affected frontend areas include `app/components/home/*`, `app/Search/page.tsx`, and `app/components/search/*`.
- Likely requires a new local content-mapping module for category definitions, blurbs, glyph placeholders, and item assignment.
- The local content-mapping module must be maintained exhaustively so published posts are either categorized once or deliberately excluded with a reason.
- Existing routes should remain intact; no backend, CMS, or data-store changes are required.

## User Experience

A visitor landing on the dashboard should quickly understand: "This is a person who works on making opaque systems understandable and controllable."

A visitor opening search should immediately see the two major branches of the work:
1. Deep systems/security research.
2. Platform/social infrastructure design.

The parent blurbs should reduce the "why are these posts next to each other?" problem by acting as orientation markers before the visitor drills into individual items.

The identity panel is intentionally a preview surface, not a destination page. It may link to existing routes such as `/Search`, `/resume.html`, GitHub, LinkedIn, or category anchors if those anchors already exist, but creating `/about` is outside this change.

## Acceptance Criteria

- Dashboard includes a new lengthwise About panel.
- The About panel renders on a normal desktop monitor without breaking the existing dashboard grid.
- The About panel includes a placeholder portrait or photo region.
- The About panel includes a concise identity sentence and short explanatory paragraph.
- The About panel links only to existing destinations; this change does not add a dedicated `/about` route.
- Search results no longer scroll underneath the title card or search bar.
- Search layout works on desktop and responsive screen sizes.
- Search/tree data supports parent category nodes.
- The `Security / Systems Work` parent category exists with a clear explanatory blurb.
- The `Platform / Social Infrastructure Work` parent category exists with a clear explanatory blurb.
- Child posts, projects, or pages render beneath the correct parent category.
- Parent cards remain useful when browsing without a query.
- Search still works for individual posts or projects.
- Every published post is assigned to exactly one top-level profile category or intentionally excluded with a documented reason.
- Existing links and routes remain functional.
