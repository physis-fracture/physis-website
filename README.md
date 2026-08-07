# PHYSIS

Pediatric radiograph triage with AI-assisted review. Next.js App Router,
Supabase, Cloudflare R2, and a Modal/FastAPI inference service.

## Stack

- **Next.js** App Router, React, TypeScript, Tailwind CSS, shadcn/ui
- **Supabase** — auth, PostgreSQL, RLS
- **Cloudflare R2** — private object storage for radiographs
- **Modal / FastAPI** — inference service

## Environment Variables

Copy `.env.example` to `.env.local` and fill in values.

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Cloudflare R2 (server-only)
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=physis
R2_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com

# Modal AI Inference (server-only)
PHYSIS_INFERENCE_BASE_URL=
PHYSIS_INFERENCE_API_KEY=
```

Never prefix R2 or inference secrets with `NEXT_PUBLIC_`. `.env.local` is
gitignored.

## Cloudflare R2 Setup

1. Create a private bucket named `physis`.
2. Create an API token (R2 → Manage R2 API Tokens) with **Object Read & Write** permission scoped to the `physis` bucket. Put the Access Key ID and Secret Access Key in `.env.local`.
3. Set the bucket CORS policy (Settings → CORS Policy) for browser uploads. Use only real origins:

```json
[
  {
    "AllowedOrigins": ["http://localhost:3000", "https://<production-domain>"],
    "AllowedMethods": ["PUT", "GET", "HEAD"],
    "AllowedHeaders": ["Content-Type"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

## Upload Flow

```text
User selects a radiograph
→ Next.js validates metadata (MIME whitelist, 32 MB max)
→ Next.js returns a presigned PUT URL (server-only), no DB writes yet
→ browser uploads bytes directly to R2 (never through Next.js)
→ browser reports completion
→ Next.js HEAD-verifies each object (size + content type)
→ only then Next.js inserts the study + verified images
→ on access, Next.js generates a short-lived presigned GET URL
```

Supported formats: PNG, JPEG, TIFF, BMP, WebP, GIF — max 32 MB.

See `docs/rules/r2.md` for the detailed rules and conventions.

## Local Development

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000 and sign in with an existing account.

## Scripts

```bash
pnpm dev      # development server
pnpm build    # production build
pnpm start    # production server
pnpm lint     # eslint
```

## Documentation

- `docs/prd.md` — product requirements
- `docs/design/` — design system and UI checklist
- `docs/rules/` — architecture, Supabase, R2, URL state, design tokens, refactoring rules
