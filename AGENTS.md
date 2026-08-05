# Frontend Agent Guide & Rule Index

This project uses Next.js App Router, React, TypeScript, Tailwind CSS, shadcn/ui, Supabase, Feature-Based Development, and Ponytail.

All frontend work must prioritize:
1. correctness
2. maintainability
3. simplicity
4. separation of concerns
5. consistency
6. accessibility
7. performance

---

# 0. Mandatory Rules & Documentation Inspection

Before performing ANY UI or frontend implementation task:

1. **Inspect Existing Code**: Read `components.json`, `app/`, `components/`, and relevant feature files.
2. **Read Required Skill & Design Docs**:
   - Must load and follow `.agents/skills/dashboard-design/SKILL.md` (`dashboard-design`) for UI/UX dashboard work.
   - Must load and follow `.agents/skills/shadcn/SKILL.md` (`shadcn`) for component composition and registries.
   - Must consult `docs/design/DESIGN_SYSTEM.md` and `docs/design/UI_CHECKLIST.md`.
3. **Query Official Docs via MCP First**: Search/query shadcn documentation via connected `@mcp:shadcn` or CLI (`pnpm dlx shadcn@latest docs <component>`, `shadcn info`) BEFORE implementing components. Never guess APIs.
4. **Use Existing shadcn Primitives**: NEVER build custom UI controls from scratch if an equivalent primitive exists in shadcn/ui. Install missing primitives via `pnpm dlx shadcn@latest add <component>`.
5. **Anti-AI-Slop**: Follow strict anti-slop rules from `dashboard-design` (no card-in-cards, decorative gradients, giant stat cards, unnecessary icons).
6. **No Emoticons & Strict Lucide Icons**: NEVER use raw text emoticons or emojis (e.g. 😀, 🚀, 👍, 🙏, ⚠️) in UI components, buttons, labels, headings, or text content. ALWAYS use official Lucide icons (`lucide-react`) configured by shadcn (`components.json` iconLibrary).

---

# 1. Specialized Rule Files Index

Read specific rule files under `docs/rules/` as needed to save token context:

- 🏗️ **Architecture & Features**: [`docs/rules/architecture.md`](file:///mnt/data/lomba/datathon/website/physis/docs/rules/architecture.md) — Feature-based folder structure, responsibilities, and barrel exports.
- ⚡ **Supabase & Queries**: [`docs/rules/supabase.md`](file:///mnt/data/lomba/datathon/website/physis/docs/rules/supabase.md) — Client usage, explicit projections, server-side filtering/pagination/sorting, and RLS security.
- 🔗 **URL State & Data Tables**: [`docs/rules/url-state-tables.md`](file:///mnt/data/lomba/datathon/website/physis/docs/rules/url-state-tables.md) — URL query params as canonical state, validation schemas, debouncing, and pagination.
- 🎨 **Design Tokens & Presets**: [`docs/rules/design-tokens.md`](file:///mnt/data/lomba/datathon/website/physis/docs/rules/design-tokens.md) — Semantic CSS variables, preset compatibility (`primary` ≠ blue), and domain-specific hardcoded colors.
- ✂️ **Ponytail & Refactoring**: [`docs/rules/ponytail-refactoring.md`](file:///mnt/data/lomba/datathon/website/physis/docs/rules/ponytail-refactoring.md) — Over-engineering prevention (Mode `full`) and focused diff rules.

---

# 2. UI Completion Checklist

Before finishing any task, run the full verification checklist in [`docs/design/UI_CHECKLIST.md`](file:///mnt/data/lomba/datathon/website/physis/docs/design/UI_CHECKLIST.md).
