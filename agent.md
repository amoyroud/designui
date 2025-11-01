# Reverse Moodboard Engine

## Overview
- Bold, Bauhaus-inspired single-page web app for uploading inspirational imagery and synthesizing aesthetic insights.
- **New:** AI-powered design direction generator that creates 2-3 personalized landing page concepts based on visual DNA and project context.
- Frontend powered by Next.js App Router with Tailwind CSS v4 (PostCSS plugin) for styling.
- Backend routes use Vercel/Next.js edge-ready API handlers that integrate with Supabase and OpenAI services.
- Design language: Geometric precision, deep blues and greens, stark contrast, grid-based layouts, dot matrix patterns, and constellation motifs.

## Architecture Snapshot
- `src/app/` – App Router entry point, layouts, and page-level UI composition.
- `src/components/` – Reusable client-side components (to be created as the UI grows).
- `src/lib/` – Shared utilities, client hooks, and integration helpers (OpenAI, Supabase, Upload pipeline).
- `app/api/` (via `src/app/api/`) – Route handlers for image ingestion, analysis orchestration, and synthesis responses. Currently stubbed; will evolve to call external services.
- Styling tokenization defined in `design-system.md`; Tailwind utilities should map to those references.

### Recent Additions

#### AI Design Directions Feature (Latest)
- **Project Context Input**: Users can describe their product/service before uploading inspirations
- **Smart Direction Generation**: LLM generates 2-3 distinct landing page concepts tailored to:
  - User's project description and target audience
  - Extracted brand DNA (colors, fonts, mood)
  - Visual inspirations provided
- **Each direction includes**:
  - Concept name and tagline
  - Color application strategy (hero, background, accent, text)
  - Typography application (headline font, body font, hierarchy)
  - Complete hero section (headline, subheadline, CTA text)
  - Layout style recommendations
  - CTA strategy (style, placement, tone)
  - Key features list
  - Reasoning for why it works for their audience
- **Comparison View**: Side-by-side direction cards with visual previews
- **Implementation**:
  - New `DesignDirection` type in types system
  - `generateDesignDirections()` LLM function with structured output
  - Design Directions component with numbered cards and color previews
  - Integrated into analyze API pipeline (only runs when context provided)

#### Major UI Redesign (Bauhaus-Inspired)
- Complete visual overhaul with geometric, forward-thinking aesthetic
- New color system: Deep blues (#2A4A8A, #1F3A72), forest greens (#1A4D2E), cream backgrounds (#F5F2ED)
- Grid overlay on body (40px×40px) with subtle animations
- Dot matrix patterns, constellation effects, and geometric circles throughout
- All components redesigned with sharp corners, 2px borders, bold typography
- Summary card now uses deep blue background with constellation pattern
- Buttons with geometric accents and translateY hover effects
- Sharp, Bauhaus-inspired typography: bold, uppercase, wide tracking

#### Component Library
- `src/lib/supabase.ts` centralises admin client creation + bucket setup logic.
- `src/lib/extractors/` holds feature extraction helpers for imagery (`image.ts`) and URLs (`url.ts`).
- `src/lib/embeddings.ts` and `src/lib/openai.ts` coordinate embedding + GPT-4o guideline synthesis with graceful fallbacks.
- `src/lib/analysis.ts` provides deterministic heuristics for clustering and baseline guideline generation when the LLM is unavailable.
- Redesigned UI components:
  - **`DesignDirections`** (NEW) – AI-generated landing page concepts:
    - Section 5.0 header with project context display
    - Grid layout (1-3 columns responsive)
    - Each direction card shows:
      - Color preview bar at top (4 color split)
      - Numbered badge (1, 2, 3)
      - Concept name and tagline
      - Hero section preview with actual fonts
      - Color application grid with swatches
      - Typography details with font families
      - Key features list
      - "Why This Works" reasoning
      - Layout style and CTA strategy
    - Hover effect: lift up on hover
  - `Dropzone` – Geometric circle icon, dashed borders, sharp corners
  - `SummaryCard` – Deep blue panel with constellation background pattern (only shown after analysis)
  - **Onboarding Card** – Replaces empty summary card before analysis:
    - "How it Works" numbered steps (1-3)
    - Pro tips for better results
    - Clear, helpful guidance instead of confusing placeholder data
  - `ThumbnailGrid` – Sharp borders, dot matrix overlay on hover, circular remove buttons
  - `GuidelinePanel` – Professional brand guideline format with numbered sections:
    - Section 2.1: Color swatches as large numbered blocks (like brand manuals)
    - Section 3.0: Typography with font specimens showing actual typefaces
    - Section 6.1: Brand voice as numbered characteristics (1-3)
    - Each font shows specimen text ("The quick brown fox...") in the actual typeface
    - Colors displayed as tall blocks with numbers, auto-adjusting text color for contrast
  - `StyleClusterList` – Grid layout with dot matrix overlays
  - `InspirationInsights` – Individual analysis cards with bold typography

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

## Design System Adherence
- All UI components follow the Bauhaus-inspired design system documented in `design-system.md`
- Consistent use of geometric elements: circles (2px borders), grids (1px lines), dot matrices (16px spacing)
- Color palette strictly adhered to: blues for primary actions, greens for accents, cream for backgrounds
- Typography: Geist Sans, bold weights (600-700), uppercase labels with 0.2-0.3em tracking
- Spacing: 8px base unit with mathematical progression (8, 16, 24, 32, 40, 48, 64, 80, 96, 128)
- Animations: constellation-pulse (12s), grid-fade (8s), translateY hover effects (-2px to -3px)
- All borders are 2px solid for primary elements, 1px for subtle dividers
- Sharp corners (0px border-radius) for Bauhaus aesthetic, circles for decorative elements

## Future Notes
- Introduce server actions or RPC helpers for Supabase once ready.
- When adding migrations, document schema changes here with sections per release.
- Monitor lint/type rules to maintain maintainability and scalability of the codebase.
- Upgrade Supabase persistence with SQL migrations + proper pgvector type once infrastructure is ready.
- Swap heuristics for production-grade color/font extraction (e.g. Playwright screenshots, advanced palette clustering).
- Fine-tune GPT prompts and support alternate open-source models for self-hosted deployments.
- Consider adding more geometric decorations: spirals, concentric circles, Fibonacci patterns
- Explore animated grid transitions for state changes

