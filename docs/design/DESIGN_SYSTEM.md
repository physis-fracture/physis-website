# Dashboard Design System

## Direction

The dashboard visual language is:

* restrained
* data-first
* medium-high density
* low decoration
* strong hierarchy
* functional
* consistent

## Containers

Do not automatically use Cards as the primary layout primitive.

Use, in order of preference:

1. spacing
2. typography
3. separators
4. borders
5. background contrast
6. cards when an independent surface is actually needed

Avoid deeply nested surfaces.

## Radius

Use restrained border radius.

Interactive components can use the project's standard radius.

Large containers should not automatically receive large rounded corners.

## Shadows

Prefer borders and background contrast.

Use shadows primarily for elevated elements such as:

* popovers
* dropdowns
* dialogs
* floating menus

Avoid shadows on every dashboard panel.

## Color

Use semantic theme tokens.

Color should communicate:

* action
* state
* severity
* category
* hierarchy

Do not use color merely to fill empty visual space.

## Typography

Keep dashboard typography compact.

Use a clear hierarchy between:

* page title
* section title
* body
* labels
* metadata

Avoid marketing-scale typography.

## Icons

Icons must serve a recognizable functional purpose.

Good:

* navigation recognition
* actions
* status
* controls

Avoid decorative icons attached to obvious headings or labels.

## Cards

Use cards for genuinely independent content surfaces.

Do not create:

* card inside card
* card for every metric
* card for every section
* card solely to create rounded borders

## Data

Data presentation takes priority over decoration.

Prefer direct representations such as:

* values
* tables
* trends
* comparisons

before charts or decorative statistics.

## Motion

Motion should be subtle and functional.

Prefer transitions for:

* opening
* closing
* resizing
* state change
* feedback

Avoid decorative entrance animations.
