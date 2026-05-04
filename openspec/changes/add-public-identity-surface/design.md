## Context

The current home dashboard is split across desktop and mobile layouts in `app/components/home/`, with desktop using a fixed grid and mobile using a stacked card flow. The search page in `app/Search/page.tsx` renders `SearchWrapper`, which filters posts by title, description, and tags and then displays a flat list of `TreeNode` cards.

The current post metadata is not sufficient for the requested parent categories. Every published post is tagged `tech`, so deriving "Security / Systems Work" and "Platform / Social Infrastructure Work" from existing frontmatter would either be brittle or force a taxonomy rewrite. The site already has a tree-shaped search renderer through `blog.children`, but there is no parent-node data model and the sticky header currently lives in the same scroll flow as results, which allows visual overlap.

The requested category split is editorial rather than taxonomic. It is meant to help a visitor understand the author's two main modes of work: deep systems/security investigation and broader platform/social infrastructure design. That means the implementation needs to preserve authorial intent, not just content metadata.

## Goals / Non-Goals

**Goals:**
- Add an identity-focused dashboard panel that fits the existing glass-card dashboard style on desktop and mobile.
- Make the search page operate as a profile navigation surface with two explicit parent categories and grouped children.
- Separate the search header region from the scrollable results region so results do not pass under the title/search controls.
- Keep the implementation small and local to the frontend without requiring a CMS or content migration.
- Make the category cards useful enough that the search page communicates site structure even before a query is entered.

**Non-Goals:**
- Redesign the overall site layout, typography, or animation system.
- Introduce a general-purpose taxonomy engine for arbitrary nested categories.
- Require all posts to be re-authored with new frontmatter before the feature can ship.
- Finalize permanent portrait assets or deeply polish custom iconography.
- Build a full About page or generalized cross-site information architecture.
- Add a new `/about` route; the dashboard panel remains a preview surface only in this change.

## Decisions

### Use explicit profile-navigation data instead of deriving structure from tags
The search page needs two opinionated parent categories that describe the author's work, not a generic content taxonomy. Because current tags are too coarse, the implementation should introduce a small local configuration module that defines:
- the two parent categories with ids, titles, blurbs, and optional glyph identifiers
- the assignment of known posts/projects/pages to a parent category
- optional featured links reused by the dashboard identity panel

The initial parent copy should track the proposal closely:
- `Security / Systems Work`: work on Linux networking, firewall behavior, fuzzing, IAM, reproducibility, and security boundaries
- `Platform / Social Infrastructure Work`: work on AI evals, SearchBench, developer tools, documentation systems, configuration interfaces, visualization, and coordination through software

The initial mapping can be explicit by slug so the proposal can be implemented without rewriting frontmatter. This also leaves room to add project/page entries alongside posts later.

The mapping should be treated as exhaustive for published posts. Every published post should be assigned to exactly one top-level profile category, or intentionally excluded with an inline comment or adjacent reason so omissions are explicit rather than accidental.

This avoids rewriting content metadata and makes the grouping logic obvious to maintain.

Alternatives considered:
- Infer categories from tags. Rejected because all current posts share the same `tech` tag and the requested categories are thematic, not mechanical.
- Add new frontmatter fields to every post. Rejected for this change because it creates unnecessary migration work and broadens scope beyond the immediate identity surface.

### Represent search entries as a dedicated parent/child tree model
The current `BlogPost` shape can already nest `children`, but parent category cards need different fields and different presentation from ordinary post cards. The implementation should define a dedicated tree model for search navigation, with explicit parent and child node variants, then transform blog posts plus config into that model before rendering.

This keeps parent-card behavior separate from post-card behavior while still allowing recursive or hierarchical rendering where useful.

Alternatives considered:
- Mutate `BlogPost` objects into synthetic parent posts. Rejected because it overloads blog metadata with non-post concepts and makes rendering logic less clear.
- Keep flat results and fake headings in the UI. Rejected because the change explicitly requires parent nodes with children underneath them.

### Split the search screen into a header region and a bounded result scroller
The search input and explanatory copy should sit in a non-overlapping header block, while the result area gets its own flex-bounded scroll container. On larger screens this should use viewport-aware height constraints within the page shell; on smaller screens it should degrade to a stacked layout without hidden content.

This solves the current overlap structurally instead of with padding hacks.

Alternatives considered:
- Keep global page scrolling and add top padding to result cards. Rejected because it is fragile and does not guarantee separation when header height changes.
- Make the whole header sticky inside the current flow. Rejected because the current sticky-only approach is the source of the overlap problem.

### Preserve parent context during filtering
When a query is active, the interface should continue to show matching children under their parent category rather than flattening matches into a single list. Parents with zero matching children should disappear, but parents with at least one match should remain visible so the visitor still understands the surrounding context of the result.

Alternatives considered:
- Flatten matching results during search. Rejected because it throws away the exact orientation value the change is meant to add.
- Always show both parents even when one becomes empty. Rejected because it adds empty visual noise during focused search.

### Add the dashboard panel as a first-class card in both home layouts
Desktop and mobile home layouts are implemented separately, so the identity panel should become a reusable component rendered in both places. On desktop it should occupy its own long card in the grid and preserve the current overall balance. On mobile it should appear as a taller stacked card near the top so the identity message appears before deep navigation.

The panel should link only to destinations that already exist in the repo or product surface, such as `/Search`, `/resume.html`, GitHub, LinkedIn, or category anchors if implemented as part of this change. A dedicated `/about` destination is explicitly deferred to a later proposal.

Alternatives considered:
- Desktop-only implementation. Rejected because the change is about public identity, which needs to remain visible on smaller devices.
- Inline the copy into the nav or hero illustration. Rejected because the request explicitly calls for a long panel with portrait, copy, and links.

### Draft real copy before layout polish
The success of this change depends heavily on the wording of the dashboard identity panel and the two category blurbs. The implementation should draft and review first-pass production copy before final spacing and visual polish work so layout decisions are made against real text rather than placeholders.

Alternatives considered:
- Use placeholder copy until the end. Rejected because the card density, line length, and category clarity all depend on the actual wording.

## Risks / Trade-offs

- [Manual post-to-category mapping can drift as new content is added] → Keep the mapping in one small module, require each published post to be assigned once or intentionally excluded with a reason, and validate the mapping during implementation.
- [Desktop grid changes can upset the existing visual balance] → Reuse the current card system and adjust grid areas conservatively instead of introducing a new layout paradigm.
- [Search now serves two jobs: lookup and profile navigation] → Keep filtering behavior simple and preserve direct title/description matching so the new structure does not hide content.
- [Category names may feel abstract without enough concrete examples] → Use blurbs with concrete nouns and ensure children render visibly beneath each parent.
- [Identity or category copy may be too vague or too long] → Draft and review first-pass copy before final visual polish so layout can be tuned to the actual text.
- [Placeholder portrait area may look unfinished] → Treat it as a deliberate reserved slot with stable dimensions and neutral styling rather than as a broken image.

## Migration Plan

No backend or content migration is required. Deployment is a frontend-only change:
1. Add the identity panel component and place it in desktop/mobile home layouts.
2. Draft and review first-pass identity-panel and category-card copy.
3. Add a local search grouping config and tree transformation layer with exhaustive post assignment or documented exclusions.
4. Update search rendering and layout so the header and results are structurally separated.
5. Verify responsive behavior and grouped navigation with the current post set.

Rollback is straightforward: revert the new panel component and search tree config/rendering changes.

## Open Questions

- Which exact existing items, beyond the current blog posts, should be included as child entries on day one if project or page links are added alongside posts?
- Whether each parent card should show a real icon asset, a typographic glyph, or no glyph in the first pass.
