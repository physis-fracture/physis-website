# Design Tokens & Preset Compatibility Rules

## Semantic Design Tokens
Use shadcn/ui semantic design tokens everywhere. Never hardcode general UI colors, borders, backgrounds, text colors, or radius when an equivalent semantic token exists.

Prefer:
- `bg-background`, `bg-card`, `bg-primary`, `bg-secondary`, `bg-muted`, `bg-destructive`
- `text-foreground`, `text-muted-foreground`, `text-primary-foreground`, `text-destructive`
- `border-border`, `border-input`, `ring-ring`

Avoid:
- `bg-blue-600`, `bg-zinc-950`, `text-gray-500`, `border-slate-200`
- Arbitrary hex / RGB / HSL values for normal UI.

## Preset Compatibility
The entire frontend MUST remain compatible with shadcn presets (`pnpm dlx shadcn@latest apply --preset <PRESET_CODE>`).
1. Never design components around a specific hardcoded palette.
2. **NEVER assume `primary` is blue, indigo, cyan, or any specific color.**
3. Never use a specific neutral palette (Zinc, Slate, Neutral) directly for normal application UI.
4. Always use semantic tokens for application surfaces.
5. Components must look correct after switching to a different shadcn preset.

## Allowed Hardcoded Semantic Colors
Hardcoded Tailwind semantic colors are allowed ONLY when carrying stable domain meaning (e.g. Critical/Danger, Warning, Success, medical image heatmaps).
Example: `className="bg-red-50 text-red-700"` for genuine `Critical` clinical priority.

## Component & Styling Best Practices
- **Primitives**: Always use shadcn components when an appropriate primitive exists (Button, Input, Select, Dialog, Sheet, DropdownMenu, Tabs, Table, Badge, Card, Tooltip, Skeleton, Alert, Form, Pagination). NEVER build custom UI controls from scratch if an equivalent primitive exists.
- **Styling**: Prefer official variants (`<Button variant="outline" />`, `<Badge variant="secondary" />`) and `cn()` for conditional classes. Avoid arbitrary values (`rounded-[11px]`, `text-[15px]`).

## Icon & Emoticon Rules
- **No Emoticons / Emojis**: NEVER use raw text emoticons or emojis (e.g. 😀, 🚀, 👍, 🙏, ⚠️) in UI components, buttons, labels, headings, or text content.
- **Official Lucide Icons**: ALWAYS use official Lucide icons (`lucide-react`) matching shadcn's configured `iconLibrary` in `components.json`.

