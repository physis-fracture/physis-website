# Feature-Based Architecture & Folder Responsibilities

This project organizes application code by business feature.

Prefer:

```text
src/
├── app/
│   ├── (auth)/
│   ├── (dashboard)/
│   ├── api/
│   └── layout.tsx
│
├── features/
│   ├── users/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── schemas/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── constants/
│   │   └── index.ts
│   │
│   ├── projects/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── schemas/
│   │   ├── types/
│   │   ├── utils/
│   │   └── index.ts
│   │
│   └── ...
│
├── components/
│   ├── ui/
│   └── shared/
│
├── lib/
│   ├── supabase/
│   ├── auth/
│   └── utils/
│
├── hooks/
├── types/
└── config/
```

Feature code belongs inside its feature. Do not place feature-specific logic into global directories.

## Feature Folder Responsibilities

Each feature may contain:

```text
feature/
├── api/
├── components/
├── hooks/
├── schemas/
├── types/
├── utils/
├── constants/
└── index.ts
```

Only create a directory when the feature actually needs it. Do not create empty architectural folders just to satisfy structure.

### api/
Contains communication with Supabase or external APIs.
- perform data access
- return predictable typed data
- handle database/API errors appropriately
- contain no presentation logic
Do not perform Supabase queries directly inside UI components.

### components/
Contains feature-specific UI (rendering & user interaction). Avoid embedding Supabase queries, complex transformations, or unrelated business logic.

### hooks/
Contains reusable React behavior or state orchestration for the feature. Do not create a custom hook solely to hide 3 trivial lines of React code.

### schemas/
Runtime validation schemas (e.g., Zod) kept near the owning feature.

### types/
Domain-specific TypeScript types. Prefer types generated from Supabase for database entities. Create additional feature types for DTOs, view models, filter state, or derived structures.

### utils/
Pure, deterministic feature-specific helpers without React state or direct DB access.

### Shared Code
- `src/components/ui`: shadcn primitives.
- `src/components/shared`: components genuinely shared by multiple unrelated features.

Do NOT prematurely move something into shared code. Promote to shared only after real reuse appears.

### Barrel Exports & Dependencies
- Use `index.ts` selectively at feature-level public API (`features/users/index.ts`).
- Avoid nested barrel-export chains across the application.
- Keep features independent whenever practical.
