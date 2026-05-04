## ADDED Requirements

### Requirement: Dashboard identity panel
The home dashboard SHALL present a dedicated identity panel that introduces the site owner as a person, summarizes the shape of the work, and provides direct navigation into the most important profile areas.

#### Scenario: Desktop dashboard shows identity panel
- **WHEN** a visitor opens the home page on a desktop layout
- **THEN** the dashboard includes a distinct long-form card with a portrait placeholder, name, concise identity sentence, short descriptive paragraph, and at least one direct navigation link

#### Scenario: Mobile home page preserves identity context
- **WHEN** a visitor opens the home page on a smaller responsive layout
- **THEN** the page includes the same identity content in a stacked card that remains readable without relying on desktop-only grid placement

### Requirement: Identity copy frames the author's work coherently
The identity panel SHALL explain the relationship between deep systems/security work and broader platform/social infrastructure work without reading like a full resume.

#### Scenario: Visitor reads identity summary
- **WHEN** a visitor scans the identity panel copy
- **THEN** the panel communicates that the author's work focuses on making opaque technical systems observable, reproducible, and easier to operate

### Requirement: Identity panel links reinforce profile navigation
The identity panel SHALL include links that help visitors move from the summary card into stronger evidence of the work areas described there.

#### Scenario: Identity links route to key destinations
- **WHEN** a visitor interacts with the identity panel links
- **THEN** the panel offers navigation only to existing destinations such as `/Search`, `/resume.html`, GitHub, LinkedIn, or implemented category anchors

#### Scenario: Dashboard panel does not introduce a new About route
- **WHEN** the identity panel is implemented for this change
- **THEN** it does not require or create a dedicated `/about` page and remains a preview surface on the dashboard

### Requirement: Identity panel uses placeholder portrait support
The dashboard identity panel SHALL reserve space for a portrait or photo even when a permanent image has not been chosen.

#### Scenario: Placeholder portrait renders without final asset
- **WHEN** no final personal photo is available
- **THEN** the panel still renders a stable portrait area that reads as intentional placeholder content rather than missing media
