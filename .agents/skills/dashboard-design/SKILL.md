---
name: dashboard-design
description: Design and implement production-quality dashboard interfaces using Next.js, Tailwind CSS, and shadcn/ui. Use for dashboard pages, layouts, tables, forms, navigation, data visualization, responsive behavior, or UI/UX reviews.
---

# Dashboard Design Skill

You are responsible for designing and implementing high-quality production dashboard interfaces.

The target stack is:

* Next.js
* React
* Tailwind CSS
* shadcn/ui
* Existing project design system and conventions

Your goal is to produce interfaces that feel intentionally designed by a strong product designer and frontend engineer.

Avoid generic AI-generated dashboard aesthetics.

## 1. Inspect Before Designing

Before changing UI:

1. Inspect the existing project structure.
2. Read `components.json`.
3. Inspect `app`, `components`, `components/ui`, and existing dashboard components.
4. Identify existing:

   * colors
   * typography
   * spacing
   * radius
   * navigation patterns
   * layout patterns
   * reusable components
5. Run or consult shadcn project information when available.
6. Reuse existing project conventions unless they are clearly inconsistent or broken.

Do not redesign the entire application when the task only concerns one page or component.

## 2. Design Philosophy

Dashboard interfaces should prioritize:

* information hierarchy
* readability
* data density
* task completion
* scanability
* consistency
* predictable interaction
* accessibility

Prefer:

* restrained visual design
* medium-high information density
* strong alignment
* clear typography
* subtle borders
* semantic colors
* compact controls
* functional whitespace
* left-aligned content
* consistent spacing

Decoration must have a functional purpose.

## 3. Anti-AI-Slop Rules

Avoid common AI-generated UI patterns.

Do not automatically:

* wrap every section inside a Card
* put Cards inside Cards
* use `rounded-xl` or `rounded-2xl` everywhere
* add gradients
* add glassmorphism
* add excessive shadows
* add decorative blur
* make every metric a giant statistic card
* create unnecessary hero sections
* use oversized headings in dashboard pages
* use a three-column feature grid without functional reason
* center-align large portions of dashboard content
* add pills/badges everywhere
* add icons to every label
* add decorative icons without information value
* add unnecessary descriptions beneath obvious headings
* create excessive whitespace like a marketing landing page
* use charts only to make the page visually interesting
* create fake statistics or placeholder business data unless explicitly requested

Avoid excessive visual nesting.

Prefer separators, spacing, typography, and alignment before introducing another container.

## 4. Dashboard Page Hierarchy

Typical page hierarchy:

Page
→ Header
→ Primary actions
→ Filters / context controls
→ Main content
→ Secondary information

Page headers should normally be compact.

Prefer something similar to:

* page title
* optional short description
* relevant actions

Do not create large marketing-style dashboard headers.

## 5. Layout

Use intentional grid structures.

Prefer:

* CSS Grid for dashboard composition
* Flexbox for local alignment
* consistent max widths when needed
* predictable horizontal padding
* consistent vertical rhythm

Do not use arbitrary spacing values unless necessary.

Spacing should communicate relationships:

* tightly related content → smaller spacing
* separate groups → larger spacing
* separate sections → clear visual separation

Avoid making every section float independently.

## 6. Sidebar and Navigation

Navigation should prioritize orientation.

Sidebar requirements:

* clear active state
* logical grouping
* concise labels
* functional icons only
* accessible tooltips when collapsed
* responsive mobile behavior
* consistent interaction states

Avoid:

* excessive sidebar decoration
* oversized logos
* badges without actionable meaning
* deeply nested navigation when unnecessary

On mobile, use an appropriate drawer/sheet navigation pattern rather than shrinking the desktop sidebar.

## 7. Data Tables

Treat tables as first-class dashboard interfaces.

When appropriate support:

* sorting
* filtering
* search
* pagination
* row actions
* bulk selection
* column visibility
* loading states
* empty states
* error states

Keep tables compact and scannable.

Numeric values should generally align consistently.

Actions should not dominate the row.

For large tables, consider:

* sticky headers
* controlled horizontal scrolling
* responsive column priorities

Do not replace naturally tabular information with cards on mobile unless that genuinely improves usability.

## 8. Forms

Forms should have:

* visible labels
* logical grouping
* useful validation
* clear error messages
* appropriate input types
* disabled states
* loading states
* success feedback when necessary

Destructive actions require clear distinction and confirmation when appropriate.

Avoid unnecessary modal forms.

Use dialogs only when preserving page context is valuable.

## 9. Data Visualization

Charts must answer a question.

Before adding a chart determine:

* what question does it answer?
* what comparison matters?
* what time range matters?
* would a table or number communicate it better?

Avoid:

* unnecessary donut charts
* excessive colors
* redundant legends
* decorative visualizations
* charts with insufficient context

Charts should have readable labels and tooltips when appropriate.

## 10. Component Strategy

Use shadcn/ui as primitives.

Do not treat shadcn components as immutable templates.

Compose them into project-specific components.

Example:

`components/ui/*`
= primitives

`components/dashboard/*`
= product-specific compositions

Prefer existing shadcn primitives before writing equivalent controls manually.

However, do not introduce a shadcn component solely because it exists.

Before using an unfamiliar shadcn component, consult current shadcn documentation or installed skill/MCP.

Respect the project's selected shadcn base implementation.

Do not blindly copy examples built for a different primitive base.

## 11. Design Tokens

Prefer semantic tokens.

Examples:

* `bg-background`
* `bg-muted`
* `text-foreground`
* `text-muted-foreground`
* `border-border`
* `text-destructive`

Avoid scattering arbitrary colors such as:

`bg-[#...]`

unless there is a specific product requirement.

Project-level visual changes should generally be represented through design tokens.

## 12. Typography

Typography should create hierarchy without excessive size differences.

Dashboard defaults should usually be restrained.

Use:

* strong page titles
* compact section headings
* readable body text
* muted supporting text
* tabular numbers where useful

Avoid using extremely large text simply to create visual hierarchy.

## 13. Responsive Design

Do not create desktop UI first and merely shrink it.

For every significant interface consider:

* desktop
* tablet
* mobile

Determine:

* which information remains visible
* which actions collapse
* which columns hide
* when navigation changes form
* how dense elements reflow

Use Tailwind responsive utilities intentionally.

Use container queries when component behavior should depend on its container instead of the whole viewport.

## 14. Accessibility

Use semantic HTML first.

Ensure:

* keyboard access
* visible focus state
* adequate contrast
* correct labels
* accessible names
* proper heading hierarchy
* correct button/link semantics
* reasonable touch targets
* appropriate ARIA only when native semantics are insufficient

Never remove focus outlines without replacing them with a visible focus indicator.

## 15. Interaction States

Every interactive component must consider:

* default
* hover
* focus
* active
* disabled
* loading
* error
* success where applicable

Every data surface should consider:

* loading
* empty
* error
* populated

Do not leave state handling until after the visual design.

## 16. Motion

Motion should communicate:

* state change
* hierarchy
* relationship
* feedback

Keep dashboard animations restrained.

Avoid:

* page elements flying into view
* excessive spring animations
* animation on every hover
* decorative continuous animations

## 17. Implementation Rules

When implementing:

1. Reuse existing components first.
2. Keep page files focused on composition.
3. Extract reusable dashboard patterns.
4. Avoid premature abstraction.
5. Preserve server components when client-side behavior is unnecessary.
6. Only add `"use client"` when required.
7. Avoid unnecessary dependencies.
8. Do not duplicate existing utility functions.
9. Keep TypeScript types explicit where they provide value.
10. Do not modify unrelated code.

## 18. UI Review

Before considering UI work complete, review it critically.

Ask:

### Hierarchy

Can the user immediately identify the most important information and actions?

### Density

Is the amount of information appropriate for a dashboard?

### Composition

Are elements aligned and grouped intentionally?

### Consistency

Are spacing, typography, controls, borders, and states consistent?

### Usability

Can common tasks be completed efficiently?

### Accessibility

Can keyboard and assistive technology users operate the interface?

### Responsive behavior

Does the layout genuinely adapt rather than simply shrink?

### AI-slop check

Does the interface contain generic patterns that were added because they "look modern" rather than because they improve the product?

Remove unnecessary decoration before finishing.

## 19. Final Standard

The final interface should feel:

* deliberate
* compact
* functional
* consistent
* polished
* product-specific

Every visual decision should be defensible based on usability, hierarchy, information structure, or brand identity.
