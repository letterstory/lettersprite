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
  siteTitle: str("SITE_TITLE", "The Signal"),
  siteDescription: str("SITE_DESCRIPTION"),
  siteUrl: resolveSiteUrl(),
  /** Short masthead tagline shown under/next to the wordmark (e.g. a motto). */
  siteTagline: str("SITE_TAGLINE"),
  /** Founding year shown in the footer ("Est. 2024"). Blank hides it. */
  established: str("SITE_ESTABLISHED"),
  /** Comma-separated section nav override. Otherwise derived from post tags. */
  sections: str("SITE_SECTIONS"),
  /** Social handle (no @) used for Twitter card attribution and footer links. */
  twitterHandle: str("SITE_TWITTER").replace(/^@/, ""),

  /**
   * Full color-palette overrides, layered on top of the selected theme. A
   * deployment can supply a whole palette — not just text and background — so
   * the theme's dynamic visuals (gradients, tinted bands, kickers) recolor
   * coherently. IMPORTANT: quote hex values in `.env` (a bare leading `#` is a
   * comment).
   */
  accentColor: str("SITE_ACCENT_COLOR"), // overrides theme.colors.primary
  secondaryColor: str("SITE_SECONDARY_COLOR"), // overrides theme.colors.secondary
  popColor: str("SITE_POP_COLOR"), // overrides theme.colors.accent (highlights)
  backgroundColor: str("SITE_BACKGROUND_COLOR"), // overrides theme.colors.background
  surfaceColor: str("SITE_SURFACE_COLOR"), // overrides theme.colors.surface
  textColor: str("SITE_TEXT_COLOR"), // overrides theme.colors.foreground
  headingColor: str("SITE_HEADING_COLOR"), // overrides heading color
  linkColor: str("SITE_LINK_COLOR"), // overrides link color
  heroFrom: str("SITE_HERO_FROM"), // hero gradient start
  heroTo: str("SITE_HERO_TO"), // hero gradient end
  /** Optional font overrides (Google Fonts family names). */
  fontBody: str("FONT_BODY"),
  fontHeading: str("FONT_HEADING"),
  fontDisplay: str("FONT_DISPLAY"),
  /** Optional logo-treatment override (see LogoStyle in src/themes/types.ts). */
  logoStyle: str("SITE_LOGO_STYLE"),
  /**
   * Optional inline logo SVG. When set, the masthead renders this SVG instead of
   * the typographic wordmark (and `SITE_LOGO_STYLE` is ignored). Pass the raw
   * `<svg>…</svg>` markup itself — not a URL — as the value; it's inlined
   * directly. `<script>` and event-handler attributes are stripped before
   * render. Height is fixed per masthead size and width scales to the SVG's
   * aspect ratio, so `width`/`height`/`viewBox` on the source are respected for
   * ratio but not absolute size. Use `currentColor` for fills/strokes to inherit
   * the theme's heading color.
   */
  logoSvg: str("SITE_LOGO_SVG"),
  /** Accessible label for the logo SVG. Defaults to `SITE_TITLE` when omitted. */
  logoAlt: str("SITE_LOGO_ALT"),

  /**
   * Newsletter capture. Off by default: the subscribe UI is fully designed but
   * has no working backend yet, so it stays hidden until a deployment opts in
   * with `NEWSLETTER_ENABLED=true` (and wires up `NEWSLETTER_ACTION`).
   */
  newsletterEnabled: bool("NEWSLETTER_ENABLED", false),
  /** Optional form `action` URL (e.g. a Mailchimp/Buttondown endpoint). */
  newsletterAction: str("NEWSLETTER_ACTION"),

  /** Content behaviour. */
  postsLimit: Math.min(Math.max(num("POSTS_LIMIT", 50), 1), 100),
  showDrafts: bool("SHOW_DRAFTS", false),
} as const;

/** True when a Letterbrace key is present; otherwise content calls no-op. */
export const hasLetterbraceKey = env.letterbraceApiKey.length > 0;
