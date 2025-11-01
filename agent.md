# Reverse Moodboard Engine

## Overview
- Minimalist single-page web app for uploading inspirational imagery and synthesizing aesthetic insights.
- Frontend powered by Next.js App Router with Tailwind CSS v4 (PostCSS plugin) for styling.
- Backend routes use Vercel/Next.js edge-ready API handlers that will later integrate with Supabase and OpenAI services.

## Architecture Snapshot
- `src/app/` – App Router entry point, layouts, and page-level UI composition.
- `src/components/` – Reusable client-side components (to be created as the UI grows).
- `src/lib/` – Shared utilities, client hooks, and integration helpers (OpenAI, Supabase, Upload pipeline).
- `app/api/` (via `src/app/api/`) – Route handlers for image ingestion, analysis orchestration, and synthesis responses. Currently stubbed; will evolve to call external services.
- Styling tokenization defined in `design-system.md`; Tailwind utilities should map to those references.

### Recent Additions
- `src/lib/supabase.ts` centralises admin client creation + bucket setup logic.
- `src/lib/extractors/` holds feature extraction helpers for imagery (`image.ts`) and URLs (`url.ts`).
- `src/lib/embeddings.ts` and `src/lib/openai.ts` coordinate embedding + GPT-4o guideline synthesis with graceful fallbacks.
- `src/lib/analysis.ts` provides deterministic heuristics for clustering and baseline guideline generation when the LLM is unavailable.
- New UI components (`GuidelinePanel`, `StyleClusterList`, `InspirationInsights`) surface analysis output in the primary flow.

## Data & Storage
- Supabase provides object storage for uploads and PostgreSQL/pgvector for structured results. Credentials live in `.env.local`.
- No migrations yet; document new tables or migrations here when added.
- All aesthetic analysis responses stored as structured JSON with embeddings + descriptive metadata for future clustering.

### Supabase schema (documented, not yet migrated)
- Storage bucket: `inspirations` (private). Images land at `image/{uuid}.ext`; URLs are recorded as JSON payloads at `url/{uuid}.json`.
- Table `inspirations`
  - `id uuid primary key`
  - `kind text` (`image` | `url`)
  - `original_name text`
  - `source_url text`
  - `storage_path text`
  - `mime_type text`
  - `width int4`
  - `height int4`
  - `created_at timestamptz default now()`
- Table `inspiration_features`
  - `inspiration_id uuid references inspirations(id)` (PK, upserted)
  - `embedding_model text`
  - `embedding vector` (or `float8[]` depending on pgvector setup)
  - `descriptors jsonb`
  - `created_at timestamptz default now()`

## Development Workflow
- Install deps: `npm install`
- Run dev server: `npm run dev`
- Lint: `npm run lint`
- Format check / write: `npm run format` / `npm run format:write`
- Add a `.env.local` (ignored) for secrets such as:
  - `OPENAI_API_KEY`
  - `OPENAI_GUIDELINE_MODEL` (optional override, defaults to `gpt-4o-mini`)
  - `OPENAI_EMBEDDING_MODEL` (optional override, defaults to `text-embedding-3-large`)
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE`
  - `SUPABASE_STORAGE_BUCKET` (defaults to `inspirations`)

## Testing Strategy
- Primary validation with unit/component tests (to be added with Jest/Testing Library) once business logic grows.
- Manual exploratory testing of drag-and-drop UX and mocked analysis flow during MVP.

## Future Notes
- Introduce server actions or RPC helpers for Supabase once ready.
- When adding migrations, document schema changes here with sections per release.
- Monitor lint/type rules to maintain maintainability and scalability of the codebase.
- Upgrade Supabase persistence with SQL migrations + proper pgvector type once infrastructure is ready.
- Swap heuristics for production-grade color/font extraction (e.g. Playwright screenshots, advanced palette clustering).
- Fine-tune GPT prompts and support alternate open-source models for self-hosted deployments.

