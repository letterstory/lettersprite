/**
 * Central, typed access to every environment variable this blog reads.
 *
 * The whole application is configured from the environment — one codebase is
 * deployed many times, and each deployment is differentiated only by its
 * `.env`. There is no database and no admin panel: the active theme, the
 * Letterbrace content source, and the site identity all come from here.
 *
 * See `.env.example` for the full list and documentation.
 */

function str(key: string, fallback = ""): string {
  const v = process.env[key];
  return v === undefined || v === "" ? fallback : v;
}

function num(key: string, fallback: number): number {
  const v = process.env[key];
  if (v === undefined || v === "") return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function bool(key: string, fallback = false): boolean {
  const v = process.env[key];
  if (v === undefined || v === "") return fallback;
  return ["1", "true", "yes", "on"].includes(v.toLowerCase());
}

/** Resolve the public base URL, preferring an explicit value, then Vercel's. */
function resolveSiteUrl(): string {
  const explicit = str("SITE_URL");
  if (explicit) return explicit.replace(/\/$/, "");
  const prod = str("VERCEL_PROJECT_PRODUCTION_URL");
  if (prod) return `https://${prod}`;
  const preview = str("VERCEL_URL");
  if (preview) return `https://${preview}`;
  return "http://localhost:9000";
}

export const env = {
  /** Letterbrace Integrations API base, e.g. https://letterbrace.com/api/integrations */
  letterbraceApiUrl: str(
    "LETTERBRACE_API_URL",
    "https://app.letterbrace.com/api/integrations",
  ).replace(/\/$/, ""),
  /** `lb_...` key. Scopes this blog to one Letterbrace org. */
  letterbraceApiKey: str("LETTERBRACE_API_KEY"),
  /** Optional: restrict the blog to a single collection within the org. */
  collectionId: str("LETTERBRACE_COLLECTION_ID"),

  /** Name of the theme to render (see src/themes). Falls back to the default. */
  theme: str("THEME", "sleek"),

  /** Site identity, used for the wordmark, metadata, OpenGraph and sitemap. */
  siteTitle: str("SITE_TITLE", "Blog"),
  siteDescription: str("SITE_DESCRIPTION"),
  siteUrl: resolveSiteUrl(),

  /** Optional, targeted color overrides layered on top of the selected theme. */
  accentColor: str("SITE_ACCENT_COLOR"), // overrides theme.colors.primary
  backgroundColor: str("SITE_BACKGROUND_COLOR"), // overrides theme.colors.background
  textColor: str("SITE_TEXT_COLOR"), // overrides theme.colors.foreground
  headingColor: str("SITE_HEADING_COLOR"), // overrides heading color
  linkColor: str("SITE_LINK_COLOR"), // overrides link color
  /** Optional font overrides (Google Fonts family names). */
  fontBody: str("FONT_BODY"),
  fontHeading: str("FONT_HEADING"),

  /** Content behaviour. */
  postsLimit: Math.min(Math.max(num("POSTS_LIMIT", 50), 1), 100),
  showDrafts: bool("SHOW_DRAFTS", false),
} as const;

/** True when a Letterbrace key is present; otherwise content calls no-op. */
export const hasLetterbraceKey = env.letterbraceApiKey.length > 0;
