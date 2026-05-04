## ADDED Requirements

### Requirement: Search presents top-level profile categories
The search experience SHALL present two top-level parent categories named "Security / Systems Work" and "Platform / Social Infrastructure Work" before or alongside their child entries so visitors can understand the major branches of work at a glance.

#### Scenario: Parent categories render with explanatory blurbs
- **WHEN** a visitor opens the search page without entering a query
- **THEN** the page shows both parent categories with short descriptions explaining the type of work grouped under each one

### Requirement: Security / Systems category is concretely described
The search experience SHALL include a `Security / Systems Work` parent category whose description makes the covered technical areas legible to a first-time visitor.

#### Scenario: Visitor reads security/systems category blurb
- **WHEN** the `Security / Systems Work` parent card is shown
- **THEN** its blurb explains that the category covers work such as Linux networking, firewall behavior, fuzzing, IAM, reproducibility, and security boundaries

### Requirement: Platform / Social Infrastructure category is concretely described
The search experience SHALL include a `Platform / Social Infrastructure Work` parent category whose description explains the broader coordination and interface concerns grouped there.

#### Scenario: Visitor reads platform/social category blurb
- **WHEN** the `Platform / Social Infrastructure Work` parent card is shown
- **THEN** its blurb explains that the category covers work such as AI evals, SearchBench, developer tools, documentation systems, visualization, configuration interfaces, and team coordination through software

### Requirement: Search groups child entries under parent categories
The search experience SHALL render child posts, projects, or pages beneath the correct parent category rather than as one flat undifferentiated list.

#### Scenario: Child entries appear under assigned parent
- **WHEN** the search tree is built for display
- **THEN** each included child entry is associated with exactly one parent category and rendered beneath that category in the result tree

#### Scenario: Parent cards may include a lightweight glyph
- **WHEN** a parent category defines a glyph
- **THEN** the search page renders it as an optional visual accent without making the glyph required for the category to display

### Requirement: Category assignment is exhaustive for published posts
The search category mapping SHALL account for every published post by assigning it to exactly one top-level profile category or intentionally excluding it with a documented reason.

#### Scenario: Published posts are not silently omitted
- **WHEN** the category configuration is reviewed against the published post set
- **THEN** each published post is either mapped once to a top-level parent or marked as intentionally excluded with an explicit reason

### Requirement: Search remains usable as content lookup
The grouped search view SHALL preserve direct lookup behavior so visitors can still filter content by matching titles, descriptions, or tags.

#### Scenario: Query narrows visible grouped results
- **WHEN** a visitor enters a search query
- **THEN** the result view filters child entries by the existing search fields and only shows parent categories that still contain at least one matching child

#### Scenario: Matching results preserve parent context
- **WHEN** a child entry matches an active search query
- **THEN** the matching child remains rendered under its parent category instead of being flattened into an ungrouped result list

### Requirement: Search header and results do not overlap
The search page SHALL keep the title and search controls visually separate from the scrollable result region.

#### Scenario: Results stay below search controls while scrolling
- **WHEN** a visitor scrolls through a long result set
- **THEN** no result content passes underneath the title card or search bar and the results remain fully visible within their own bounded scrolling region

#### Scenario: Responsive layouts preserve access to controls and results
- **WHEN** a visitor uses the search page on a smaller viewport
- **THEN** the search controls remain accessible and the result region adapts without clipping or hiding content beneath the header
