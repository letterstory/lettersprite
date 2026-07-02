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
| `LETTERBRACE_API_KEY` | yes | – | `lb_...` key with the `article:read` capability. Scopes the blog to one collection. |
| `LETTERBRACE_API_URL` | no | `https://app.letterbrace.com/api/integrations` | API base URL. |
| `LETTERBRACE_COLLECTION_ID` | no | – | Scope the blog to one collection within the org. |
| `THEME` | no | `sleek` | Name of a theme in `src/themes` (ships with `sleek`). |
| `SITE_TITLE` | no | `Blog` | Wordmark and metadata title. |
| `SITE_DESCRIPTION` | no | – | Meta description / index intro. |
| `SITE_URL` | no | auto (Vercel) / `localhost` | Public base URL for canonical links, OpenGraph and sitemap. |
| `SITE_BACKGROUND_COLOR` | no | theme default | Page background color. |
| `SITE_TEXT_COLOR` | no | theme default | Body text color. |
| `SITE_HEADING_COLOR` | no | theme text color | Heading (h1–h6) color. |
| `SITE_LINK_COLOR` | no | theme accent | Inline link color in article content. |
| `SITE_ACCENT_COLOR` | no | theme default | Accent for buttons, tags, and "read more". |
| `FONT_BODY` | no | theme default | Google Fonts family for body text (weights 400/700). |
| `FONT_HEADING` | no | theme default | Google Fonts family for headings. |
| `POSTS_LIMIT` | no | `50` | Max posts fetched for the index (1–100). |
| `SHOW_DRAFTS` | no | `false` | Include draft-status posts. |

## Themes

Five themes ship out of the box (see [`src/themes`](./src/themes)). Select one
with `THEME`; `sleek` is the default and the template for new ones.

| Theme | Scheme | Layout | Look |
| --- | --- | --- | --- |
| `sleek` | light | list | Modern minimal sans, indigo accent |
| `classic` | light | list | Warm editorial serif, rust accent |
| `minimal` | light | grid | Monochrome card grid, geometric sans |
| `magazine` | light | magazine | Bold display-serif headlines, red accent |
| `midnight` | dark | list | Dark, soft-blue accent, modern sans |

A theme controls:

- **Colors** — background, surface, text, muted, border, accent, link, heading.
- **Fonts** — body, heading, and mono (each optionally loaded from Google Fonts).
- **Shape & measure** — corner radius, reading width, container width.
- **Layout** — how the index arranges posts: `list`, `grid`, or `magazine`.
- **Scheme** — `light` or `dark` (keeps native controls and scrollbars in sync).

Switch themes by setting `THEME` in the environment. Fine-tune any theme per
deployment with the `SITE_*_COLOR` overrides (background, text, heading, link,
accent) and `FONT_BODY` / `FONT_HEADING`.

### Adding a theme

1. Copy `src/themes/sleek.ts` to `src/themes/<name>.ts` and adjust its tokens.
2. Import and register it in the `themes` map in `src/themes/index.ts`.
3. Deploy with `THEME=<name>`.

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
  themes/                 Theme definitions, registry, and CSS/font serializers
  lib/letterbrace/        API client + defensive payload normalization
  lib/sanitize.ts         Article HTML sanitizer (XSS-safe render)
  components/             Header, footer, cards, post content
  app/                    Routes: index, /posts/[slug], robots, sitemap
```

## Scripts

- `npm run dev` – development server
- `npm run build` – production build
- `npm run start` – serve the production build
- `npm run lint` – ESLint
