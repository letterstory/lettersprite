# LetterSprite

A blog frontend for [Letterbrace](https://letterbrace.com). It reads articles
from a Letterbrace collection and renders them with a selectable theme.

**One codebase, many blogs.** Deploy this project as many times as you like —
each deployment is a separate blog, connected to a different Letterbrace
collection and styled with a different theme. Everything is configured through
environment variables: **there is no database and no admin panel.**

## How it works

- **Content** is fetched from the Letterbrace Integrations API
  (`GET /published`) at **build time** and baked into fully static HTML — no API
  calls happen at request time. Updating content means triggering a new build.
  The blog is read-only against Letterbrace — it never writes.
- **Theming** is a bundle of design tokens (colors, fonts, layout) selected by
  the `THEME` environment variable. Themes are plain data committed to the repo.
- **Configuration** lives entirely in the environment (`src/env.ts`). To change
  a blog, change its env and redeploy.

## Quick start (local)

```bash
npm install
cp .env.example .env.local     # then edit .env.local
npm run dev                    # http://localhost:9000
```

Set at minimum `LETTERBRACE_API_KEY`. Without a key the site shows three sample
posts — a live preview of the active theme — instead of real content. They
disappear as soon as a key is set.

## Configuration

All configuration is via environment variables. See [`.env.example`](./.env.example).

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `LETTERBRACE_API_KEY` | yes | – | `lb_...` key with the `article:read` capability. Scopes the blog to one collection. Without it, sample stories render and the site is `noindex`. |
| `LETTERBRACE_API_URL` | no | `https://app.letterbrace.com/api/integrations` | API base URL. |
| `LETTERBRACE_COLLECTION_ID` | no | – | Scope the blog to one collection within the org. |
| `THEME` | no | `sleek` | One of 15 publication themes in `src/themes` (see below). |
| `SITE_TITLE` | no | `The Signal` | Wordmark and metadata title. |
| `SITE_TAGLINE` | no | – | Short standfirst under the masthead + in the footer. |
| `SITE_DESCRIPTION` | no | – | Meta description / index intro. |
| `SITE_ESTABLISHED` | no | – | Founding year, shown as "Est. YYYY". |
| `SITE_TWITTER` | no | – | Social handle (no `@`) for the X card + footer link. |
| `SITE_SECTIONS` | no | auto (from tags) | Comma-separated masthead nav override. |
| `SITE_URL` | no | auto (Vercel) / `localhost` | Public base URL for canonical links, OpenGraph, RSS and sitemap. |
| `SITE_ACCENT_COLOR` | no | theme default | Primary brand accent (buttons, active nav). |
| `SITE_SECONDARY_COLOR` | no | theme default | Second brand color (links, hover). |
| `SITE_POP_COLOR` | no | theme default | Highlight/pill/kicker pop color. |
| `SITE_BACKGROUND_COLOR` / `SITE_SURFACE_COLOR` | no | theme default | Page + raised-surface colors. |
| `SITE_TEXT_COLOR` / `SITE_HEADING_COLOR` / `SITE_LINK_COLOR` | no | theme default | Text, heading and link colors. |
| `SITE_HERO_FROM` / `SITE_HERO_TO` | no | theme default | Hero gradient stops. |
| `FONT_DISPLAY` / `FONT_HEADING` / `FONT_BODY` | no | theme default | Google Fonts families (display headlines / headings / body). |
| `SITE_LOGO_STYLE` | no | theme default | Force a logo treatment: `serif`, `sans-bold`, `condensed`, `mono`, `boxed`, `underline`, `monogram`. |
| `NEWSLETTER_ENABLED` | no | `false` | Show the subscribe capture (hidden by default — no backend yet). |
| `NEWSLETTER_ACTION` | no | – | Form `action` URL to wire subscribe to a real provider. |
| `POSTS_LIMIT` | no | `50` | Max posts fetched for the index (1–100). |
| `SHOW_DRAFTS` | no | `false` | Include draft-status posts. |

## Themes

Fifteen publication-grade themes ship out of the box (see
[`src/themes`](./src/themes)). Each is a whole look — palette, fonts, masthead,
homepage layout and logo treatment — modeled to feel like a real outlet. Select
one with `THEME`.

| Theme | Scheme | Home layout | Look |
| --- | --- | --- | --- |
| `sleek` | light | grid | Clean modern startup blog, indigo/pink |
| `classic` | light | column | Warm editorial serif longform, rust |
| `minimal` | light | grid | Monochrome geometric card grid |
| `magazine` | light | glossy | Cinematic hero + bold grid, display serif, red |
| `midnight` | dark | column | Dark reading, soft blue/violet, monogram flag |
| `gazette` | light | broadsheet | Paper-of-record: serif flag, hairline rules |
| `dispatch` | light | feed | Tech-news river, electric-green, popular rail |
| `metro` | light | mosaic | Loud culture magazine, condensed, hot red |
| `review` | light | column | Refined all-serif longform on cream |
| `signal` | dark | glossy | Vivid tech-culture, purple→cyan, boxed logo |
| `current` | light | grid | Stark black/white + electric teal, heavy grotesque |
| `ledger` | light | feed | Business & markets desk, navy + orange |
| `atelier` | light | grid | Warm-paper lifestyle quarterly, Fraunces serif |
| `noir` | dark | glossy | Dark neon crypto terminal, mono meta |
| `chronicle` | light | broadsheet | Politics & economics weekly, crimson boxed flag |

A theme controls:

- **Palette** — background, surface(s), text, muted, border, plus a real brand
  system: primary, secondary and accent colors and a hero gradient, all wired to
  dynamic visuals (tinted bands, colored kickers, pills, gradients).
- **Fonts** — display, heading, body and mono (each optionally from Google Fonts,
  with an italic axis when needed).
- **Home layout** — one of six distinct fronts: `broadsheet`, `feed`, `mosaic`,
  `glossy`, `column`, `grid`.
- **Article layout** — `standard`, `feature` (wide hero, drop cap) or `editorial`.
- **Logo** — a build-time typographic masthead: `serif`, `sans-bold`,
  `condensed`, `mono`, `boxed`, `underline` or `monogram`.
- **Features** — drop caps, kickers, hairline rules, uppercase nav, a colored top
  rule, a centered masthead.
- **Scheme** — `light` or `dark` (keeps native controls and scrollbars in sync).

Every post also gets, deterministically and for free (no database): a persistent
byline (author + role + avatar), a stable dateline, a reading time, a section,
and a set of suggested "more stories". See `src/lib/` (`author.ts`,
`editorial.ts`, `related.ts`, `rng.ts`).

Fine-tune any theme per deployment with the palette and font overrides above —
supply a whole palette, not just two colors.

### Adding a theme

1. Copy `src/themes/sleek.ts` to `src/themes/<name>.ts` and adjust its tokens.
2. Import and register it in the `themes` map in `src/themes/index.ts`.
3. Run `npm run generate:covers` to produce its fallback cover art.
4. Deploy with `THEME=<name>`.

## SEO & syndication

Built for an outlet that must rank and syndicate with no human in the loop:

- **Structured data** — an Organization + WebSite JSON-LD graph site-wide, and
  `BlogPosting` + `BreadcrumbList` per article (`src/lib/seo.ts`), with absolute
  image URLs and `Person` bylines.
- **Metadata** — per-article OpenGraph (`article:*`, author, section, tags) and
  Twitter cards, `max-image-preview:large` robots, self-referencing canonicals.
- **Feeds & maps** — a static RSS feed at `/feed.xml`, an enriched
  `sitemap.xml` (sections + posts + cover images), and `robots.txt`.
- **Section pages** — `/sections/[slug]` index pages give the nav real
  destinations and extra indexable surface.
- Sample/preview builds (no API key) are automatically `noindex`.

Themes drive the UI through CSS custom properties (`src/themes/css.ts`), applied
to `<html>` in the root layout. Tailwind utilities like `bg-background`,
`text-primary`, and `font-heading` are wired to these variables in
[`src/app/globals.css`](./src/app/globals.css), so a new theme needs no
component changes.

## Deploying a fleet on Vercel

Each blog is one Vercel project pointed at this same repository, differentiated
only by its environment variables:

1. Create a Vercel project from this repo (Next.js is auto-detected).
2. Set the environment variables above for that project (at least
   `LETTERBRACE_API_KEY`, `THEME`, `SITE_TITLE`, `SITE_URL`).
3. Deploy. Repeat per blog.

The site is fully static: both env values and Letterbrace content are read at
**build time**. **Any change — a variable, or new/edited posts — requires a
rebuild** to appear. On Vercel, trigger rebuilds with a
[Deploy Hook](https://vercel.com/docs/deploy-hooks): call it from a Letterbrace
webhook when content changes, or on a schedule.

## Content model

Content comes from Letterbrace's `GET /published` endpoint — the frozen
published `title` and `content`, plus `slug`, `published_at`, and
`collection_id`.
[`src/lib/letterbrace/normalize.ts`](./src/lib/letterbrace/normalize.ts) maps
that payload onto a stable `Post` shape and is tolerant of missing or renamed
fields (e.g. it falls back to a `summary` field when no `title` is present).
Article HTML is sanitized in
[`src/lib/sanitize.ts`](./src/lib/sanitize.ts) before rendering. If your payload
differs, adjust the normalizer — nothing else needs to change.

## Project structure

```
src/
  env.ts                  Central, typed environment access
  themes/                 15 themes, registry, CSS/font serializers, type system
  lib/letterbrace/        API client + defensive payload normalization
  lib/author.ts           Deterministic persistent bylines
  lib/editorial.ts        Reading time, stable datelines, sections
  lib/related.ts          Suggested-reading selection
  lib/seo.ts              JSON-LD (Organization, BlogPosting, Breadcrumb)
  lib/sanitize.ts         Article HTML sanitizer (XSS-safe render)
  components/             Logo, masthead, cards, newsletter, share, JSON-LD
  components/home/        Six distinct homepage layout renderers
  app/                    Routes: index, /posts/[slug], /sections/[slug],
                          feed.xml, robots, sitemap
```

## Scripts

- `npm run dev` – development server
- `npm run build` – production build
- `npm run start` – serve the production build
- `npm run lint` – ESLint
