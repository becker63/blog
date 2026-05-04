## 1. Dashboard Identity Panel

- [x] 1.1 Identify the reusable home dashboard card pattern and choose desktop/mobile insertion points for the new identity panel.
- [x] 1.2 Draft and review first-pass copy for the dashboard identity panel, `Security / Systems Work`, and `Platform / Social Infrastructure Work`.
- [x] 1.3 Confirm the identity panel links only to existing destinations and does not introduce a new `/about` route.
- [x] 1.4 Create an identity panel component with placeholder portrait space, name, identity sentence, explanatory paragraph, and optional destination links.
- [x] 1.5 Add the identity panel to the desktop dashboard grid without breaking the current card balance or latest-post visibility.
- [x] 1.6 Add the identity panel to the mobile home layout in a readable stacked position near the top of the page.

## 2. Search Layout Containment

- [x] 2.1 Inspect the current search page shell and define a header/results split that avoids overlap structurally.
- [x] 2.2 Refactor the search page so the title and search controls live in a dedicated header region separate from the result scroller.
- [x] 2.3 Add explicit height or flex constraints to the result region so long result sets scroll below the controls on desktop and responsive layouts.
- [x] 2.4 Verify that result cards never pass underneath the title card or search bar during long-scroll interaction.

## 3. Search Tree Model And Category Data

- [x] 3.1 Define a dedicated parent/child search tree model that supports parent blurbs, optional glyphs, and nested child entries.
- [x] 3.2 Add local configuration for the two parent categories, including titles, blurbs, and placeholder glyph choices.
- [x] 3.3 Create an explicit mapping from current posts, projects, or pages into `Security / Systems Work` or `Platform / Social Infrastructure Work`.
- [x] 3.4 Validate that every published post is assigned to exactly one top-level category or intentionally excluded with a documented comment or reason.
- [x] 3.5 Build a transformation layer that combines blog metadata and the category config into grouped search tree data.

## 4. Search Rendering Behavior

- [x] 4.1 Implement visible parent category cards that render before their child entries when browsing without a query.
- [x] 4.2 Render child entries beneath the correct parent using the grouped tree model.
- [x] 4.3 Preserve existing title/description/tag filtering for child entries while hiding parent categories that have no matches.
- [x] 4.4 Preserve parent context for matching children during active search instead of flattening results into one list.
- [x] 4.5 Keep keyboard input and route behavior intact for the existing search interactions.

## 5. Validation And Polish

- [x] 5.1 Check visual density, spacing, and glyph treatment so the search page remains informative without becoming cluttered.
- [ ] 5.2 Test desktop and smaller responsive layouts for the dashboard and search page.
- [x] 5.3 Run the repo's typecheck, lint, and build validation relevant to the changed frontend paths.
