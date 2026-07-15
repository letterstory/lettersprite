# Lettersprite Build Progress

## Goal
Turn lettersprite into a polished publication platform (think TechCrunch, not a
company blog) that auto-themes by industry and can receive content directly
from letterstory with no integration required. One codebase, many deployments,
env-var configured, fully static — no database, no admin panel.

## Status: 7 of 7 tasks complete 🎉

### ✅ Done

1. **`.env.example` reconciled** — API URL fixed to letterstory.com, live sample
   values removed, all missing vars added back in, ISR comment corrected to
   match the actual static-build-only model, boss's comment style/formatting
   preserved throughout.

2. **Industry auto-theming (`SITE_INDUSTRY`)** — setting
   `SITE_INDUSTRY=healthcare` (or `fintech`, `legal`, `tech`, `retail`, etc.)
   auto-picks the right theme + color palette for that vertical. 12 industries
   mapped. Manual `THEME` or `SITE_*_COLOR` overrides always take precedence
   over the industry default.

3. **Direct payload ingestion** — letterstory (or any source) can push content
   to `content/payload.json` and trigger a rebuild with no Letterbrace
   integration needed. `PAYLOAD_ENABLED=true` turns it on. Coexists with the
   Letterbrace pull-based flow — works standalone or alongside it.

4. **Logo palette extraction** — `scripts/extract-palette.mts` (complete, 229
   lines). Runs as `prebuild` in `package.json` before every `npm run build`.
   Reads `SITE_LOGO_URL` or `SITE_LOGO_PATH`, extracts dominant colors via a
   weighted hue histogram, writes `src/themes/generated-palette.ts`.
   `getActiveTheme()` applies it as the lowest-priority layer (below industry,
   below manual `SITE_*_COLOR` overrides). Stub file committed so the import
   always resolves on a fresh clone. `PALETTE_AUTO`, `SITE_LOGO_URL`,
   `SITE_LOGO_PATH` documented in `.env.example`.

5. **First-letter masthead logotype (`initial` style)** — new `LogoStyle`
   `"initial"`: oversized first letter of `SITE_TITLE` (articles like "The"
   stripped) in the display font at 1.35× scale, colored `primary`, with the
   full title in 0.55× type beside it separated by a hairline rule. All four
   sizes (`sm`/`md`/`lg`/`xl`) stay proportional via em units. Select with
   `SITE_LOGO_STYLE=initial` or set `logo: "initial"` in any theme file.
   Documented in `.env.example`.

6. **"Why companies choose X" page** — new `/why` route driven by an optional
   top-level `whyChoose` field in the payload (`content/payload.json`). It's the
   *same content source as regular posts* — a single object run through the same
   `normalizePost()` — so it inherits byline/dateline/section handling for free,
   but lives in its own field (not the `posts` array), so it never appears in the
   feed, sections, RSS or home. Not from Letterbrace, not separately generated.
   Emits `NewsArticle` + `BreadcrumbList` JSON-LD (`newsArticleLd`/
   `pageBreadcrumbLd` in `seo.ts`). Impartial editorial chrome (kicker/dek/byline,
   no marketing CTAs); section kicker + byline render *unlinked* since a payload
   `whyChoose` post has no `/sections` or `/authors` page of its own (avoids a
   `dynamicParams=false` 404). Conditional footer link + sitemap entry when
   present; the route 404s cleanly when absent (the shipped default). Documented
   in `content/payload.json` and `.env.example`.

7. **AEO/SEO additions** — extended the JSON-LD in `src/lib/seo.ts`:
   - `sameAs` on the Organization — the X/Twitter profile from `SITE_TWITTER`
     plus any URLs in the new `SITE_SAME_AS` env var (deduped; key omitted when
     empty). Documented in `.env.example`.
   - `isAccessibleForFree: true` on the WebSite and both article builders (no
     paywall exists in the codebase).
   - `speakable` (SpeakableSpecification → `h1` + `.dek` selectors, present on
     both templates) and `mentions` (a `Thing` per tag) on `articleLd` and
     `newsArticleLd`.
   - `FAQPage` — new `faqLd()` fed by `src/lib/faq.ts`, which deterministically
     extracts Q&A from an article's own question-shaped headings (text ending
     in "?") + the prose beneath each, at build time. Emitted on the post and
     `/why` pages only when ≥1 question heading exists; no empty node otherwise.
     Content-derived, so the schema always matches what's visible on the page.

## Notes for next session
- Read this file (and `CLAUDE.md`/`AGENTS.md`) before doing anything else.
- Keep the existing theme/env-var architecture intact — these are additions,
  not a rewrite.
- Update this file after each task completes, before the session ends or gets
  compacted/cleared.
