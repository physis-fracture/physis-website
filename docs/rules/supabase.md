# Supabase Architecture & Query Rules

## Architecture Rules
- Keep Supabase clients centralized in `src/lib/supabase/` (`client.ts`, `server.ts`, `middleware.ts`, `database.types.ts`).
- Use the appropriate client for the execution environment.
- Never expose service-role credentials to browser code.
- Feature-specific queries belong inside `features/<feature>/api/` (e.g. `features/users/api/get-users.ts`), not directly inside UI components.

## Query Rules
- Select only required columns when practical. Avoid `.select("*")` for large entities. Prefer explicit projections.
- Server-side Filtering, Pagination, Sorting, and Search: Perform these on Supabase server-side when datasets can grow. Do not fetch an entire table to filter/paginate in browser.
- Always handle Supabase errors explicitly. Do not silently return fallback data for unexpected database failures.
- RLS Boundary: Respect Supabase Row Level Security as part of the security boundary. UI hiding is not authorization.
