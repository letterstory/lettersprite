@AGENTS.md

# LetterSprite — Letterbrace blog frontend

Env-driven, multi-tenant blog. One codebase deployed many times; each deployment
is configured entirely by environment variables. **No database, no admin panel.**

- **Content**: fetched from the Letterbrace Integrations API (`GET /published`,
  the frozen published title + content) in `src/lib/letterbrace/`. `normalize.ts`
  is deliberately defensive — adjust the field mapping there if the real payload
  differs. Read-only; the blog never writes to Letterbrace.
- **Theming**: `src/themes/` — each theme (`Theme` in `types.ts`) is a full
  publication look: a color *palette* (primary/secondary/accent + hero gradient),
  display/heading/body/mono fonts, a `home` layout (`broadsheet|feed|mosaic|
  glossy|column|grid` → a renderer in `src/components/home/`), an `article`
  layout, a `logo` treatment (`src/components/Logo.tsx`), and `features` flags.
  `css.ts` serializes the palette to CSS vars on `<html>`; derived tones are
  computed in `app/globals.css` via `color-mix`. Tailwind utilities bind to the
  vars there. 15 themes ship.
- **Generated editorial metadata** (no database, all deterministic so it never
  drifts across builds): persistent bylines (`lib/author.ts`), stable datelines +
  reading time + sections (`lib/editorial.ts`), suggested reading (`lib/related.ts`),
  seeded via `lib/rng.ts`. SEO/JSON-LD lives in `lib/seo.ts`.
- **Config**: `src/env.ts` centralizes all env access (palette + font + newsletter
  overrides included). See `.env.example`.
- **Rendering**: App Router, fully static (SSG). The Letterbrace payload is
  fetched at build time (`fetch` with `cache: "force-cache"`; routes marked
  `dynamic = "force-static"`, `/posts/[slug]` and `/sections/[slug]` also
  `dynamicParams = false`) and baked into static HTML. Content updates require a
  rebuild. Article HTML is sanitized in `src/lib/sanitize.ts` before render.

To add a theme: create `src/themes/<name>.ts` (copy `sleek.ts`), register it in
`src/themes/index.ts`, then run `npm run generate:covers`. No component changes
needed.
