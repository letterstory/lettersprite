@AGENTS.md

# LetterSprite — Letterbrace blog frontend

Env-driven, multi-tenant blog. One codebase deployed many times; each deployment
is configured entirely by environment variables. **No database, no admin panel.**

- **Content**: fetched from the Letterbrace Integrations API (`GET /published`,
  the frozen published title + content) in `src/lib/letterbrace/`. `normalize.ts`
  is deliberately defensive — adjust the field mapping there if the real payload
  differs. Read-only; the blog never writes to Letterbrace.
- **Theming**: `src/themes/` — each theme is a token bundle selected by the
  `THEME` env var. `src/themes/css.ts` serializes a theme to CSS variables
  (injected on `<html>` in `app/layout.tsx`) and a Google Fonts URL. Tailwind
  utilities are bound to those variables in `app/globals.css`.
- **Config**: `src/env.ts` centralizes all env access. See `.env.example`.
- **Rendering**: App Router, fully static (SSG). The Letterbrace payload is
  fetched at build time (`fetch` with `cache: "force-cache"`; routes marked
  `dynamic = "force-static"`, `/posts/[slug]` also `dynamicParams = false`) and
  baked into static HTML. Content updates require a rebuild. Article HTML is
  sanitized in `src/lib/sanitize.ts` before render.

To add a theme: create `src/themes/<name>.ts`, register it in
`src/themes/index.ts`. No component changes needed.
