# Ponytail Rules & Refactoring Guidelines

## Ponytail Rules (Mode: Full)
Ponytail is enabled to prevent over-engineering, speculative infrastructure, custom reinvented utilities, premature extensibility, and AI-generated code bloat.

Ponytail does NOT mean code golf. Never sacrifice readability, correctness, validation, error handling, security, type safety, or accessibility.

Before writing code, ask:
1. Does this already exist?
2. Can existing framework or standard library functionality solve it?
3. Can existing project code solve it?
4. Can shadcn solve the primitive requirement?
5. Is this abstraction currently necessary?
6. Can the implementation remain simpler without reducing maintainability?

Prefer the smallest implementation that remains clear and production-quality.

## Refactoring Rules
When working on an existing feature:
- Do not refactor unrelated code.
- Do not rewrite working architecture merely because another style is theoretically cleaner.
- Refactor only when necessary for the task, fixing a concrete problem, removing clear duplication, or reducing meaningful complexity.
- Keep diffs focused and small.
