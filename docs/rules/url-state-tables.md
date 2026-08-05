# URL State & Table Rules

## URL as Canonical State
For dashboard tables, URL query parameters are the canonical source of truth for:
- `search`
- `page` (default: 1)
- `pageSize` (default: 20)
- `sort` (default: `created_at`)
- `order` (default: `desc`)
- Domain filters (e.g. `status`, `role`, `category`, `from`, `to`)

Refreshing the page must preserve table state. Copying the URL must reproduce the exact view. Browser back/forward navigation must work correctly.

## Query Parameter Validation & Search
- Parse and normalize query parameters (e.g. `features/users/schemas/user-query.schema.ts`). Safely fall back to supported defaults for invalid values.
- Search input must synchronize with URL parameters and be debounced when triggering remote fetches.
- Changing search or filter parameters MUST reset `page=1`.

## Pagination & Sorting
- Server-driven pagination: URL stores `page`, backend Supabase query applies `.range(from, to)`.
- UI must reflect current page, page size, total results, and total pages when available.
- Whitelist and validate sortable columns before passing to ordering queries.
