/**
 * A Theme is a self-contained bundle of design tokens plus layout choices.
 * Themes are plain data (no React), committed to the repo, and selected at
 * runtime by the `THEME` environment variable. Adding a new theme is just a
 * new file in this directory registered in `index.ts`.
 *
 * A theme is meant to make one deployment feel like a *real publication* — a
 * distinct masthead, a full color palette, an editorial layout, and a
 * recognizable logo treatment — not just a recolored template.
 */

/**
 * How the homepage arranges stories. Each value maps to a dedicated renderer in
 * `src/components/home/` and produces a structurally distinct front page.
 *
 * - `broadsheet` — a dominant lead story with ruled columns (The New York Times).
 * - `feed` — a river of stories with thumbnails and a rail (TechCrunch, Axios).
 * - `mosaic` — a bold, asymmetric editorial grid (New York Magazine, The Cut).
 * - `glossy` — a big cinematic hero over a card grid (Wired, The Verge).
 * - `column` — an elegant, restrained single/dual column (The Atlantic, Slate).
 * - `grid` — a clean uniform card grid (lifestyle / minimal).
 */
export type HomeLayout =
  | "broadsheet"
  | "feed"
  | "mosaic"
  | "glossy"
  | "column"
  | "grid";

/**
 * How the article page reads.
 * - `standard` — centered reading measure, clean.
 * - `feature` — full-bleed hero, generous scale, optional drop cap.
 * - `editorial` — serif long-form with ruled section breaks.
 */
export type ArticleLayout = "standard" | "feature" | "editorial";

/**
 * How the wordmark is rendered as a "logo" at build time. Purely a font +
 * treatment choice — no image asset — so any `SITE_TITLE` gets a masthead.
 * See `src/components/Logo.tsx`.
 */
export type LogoStyle =
  | "serif" // high-contrast serif masthead (NYT / Atlantic)
  | "sans-bold" // heavy tight sans wordmark (TechCrunch / Verge)
  | "condensed" // condensed uppercase, wide or tight tracking (magazines)
  | "mono" // monospace, techy, bracketed
  | "boxed" // inverted solid box around the name (Vox / Verge)
  | "underline" // accent rule under the wordmark
  | "monogram"; // initial tile + wordmark

/**
 * A font used by the theme. `family` is the CSS `font-family` stack. When
 * `google` is set, the corresponding stylesheet is loaded from Google Fonts;
 * omit it for pure system-font stacks (no network request).
 */
export interface FontSpec {
  family: string;
  google?: {
    /** Google Fonts family name, e.g. "Inter". Spaces are encoded for you. */
    name: string;
    /** Weights to load, e.g. [400, 600, 700]. */
    weights: number[];
    /** Load the italic axis too (needed for editorial pull quotes / emphasis). */
    italic?: boolean;
  };
}

/**
 * The full color palette. A theme is expected to supply a real, multi-color
 * system — not just text-on-background — so layouts can build dynamic visuals
 * (gradients, tinted section bands, colored kickers, pills). Optional tokens
 * degrade gracefully (see `themeToCssVars`).
 */
export interface ThemeColors {
  /** Page background. */
  background: string;
  /** Raised surfaces: cards, code blocks. */
  surface: string;
  /** A second raised tone: footer, alternating bands, insets. Defaults `surface`. */
  surfaceAlt?: string;
  /** Primary body text. */
  foreground: string;
  /** Secondary/de-emphasised text: dates, captions, bylines. */
  muted: string;
  /** Hairlines and dividers. */
  border: string;
  /** Primary brand accent: buttons, active nav, "read more". */
  primary: string;
  /** Text/icon color placed on top of `primary`. */
  primaryForeground: string;
  /** Second brand color for variety (alt kickers, hover, links). Defaults `primary`. */
  secondary?: string;
  /** A third pop color for highlights, badges and marks. Defaults `secondary`. */
  accent?: string;
  /** Inline link color in article content. Defaults to `primary`. */
  link?: string;
  /** Heading color (h1–h6). Defaults to `foreground`. */
  heading?: string;
  /** Eyebrow / section-label ("kicker") color. Defaults to `primary`. */
  kicker?: string;
  /** Hero gradient start. When both hero stops are set, layouts may use them. */
  heroFrom?: string;
  /** Hero gradient end. */
  heroTo?: string;
}

/** Optional editorial treatments a theme can switch on. All default off/false. */
export interface ThemeFeatures {
  /** Drop cap on the first paragraph of feature/editorial articles. */
  dropCap?: boolean;
  /** Show all-caps section kickers/eyebrows on cards and headers. */
  kickers?: boolean;
  /** Draw hairline rules between stories (broadsheet feel). */
  rules?: boolean;
  /** Uppercase, tracked navigation labels. */
  uppercaseNav?: boolean;
  /** Tighten headline leading + tracking for a punchy magazine look. */
  tightHeadlines?: boolean;
  /** Render a thin colored rule across the very top of the page (masthead tab). */
  topRule?: boolean;
  /** Force the centered "flag" masthead even when the home layout is left-aligned. */
  centeredMasthead?: boolean;
}

export interface Theme {
  /** Stable identifier used by the `THEME` env var. Keep it kebab-case. */
  name: string;
  /** Human-readable name (for docs / debugging). */
  label: string;
  /** One-line description of the look. */
  description: string;
  /** Drives `color-scheme` so native controls and scrollbars match. */
  colorScheme: "light" | "dark";
  colors: ThemeColors;
  fonts: {
    /** Big display headlines (hero, article titles). Falls back to `heading`. */
    display?: FontSpec;
    /** Section headings and card titles. */
    heading: FontSpec;
    /** Body / reading text. */
    body: FontSpec;
    /** Monospace (code, kickers in some themes). */
    mono: FontSpec;
  };
  /** Border radius applied to cards, images and buttons, e.g. "0.5rem". */
  radius: string;
  /** Reading measure for article bodies, e.g. "42rem". */
  contentWidth: string;
  /** Outer container width for index/grid layouts, e.g. "72rem". */
  containerWidth: string;
  /** How the homepage is laid out. */
  home: HomeLayout;
  /** How the article page reads. */
  article: ArticleLayout;
  /** How the wordmark is rendered as a masthead logo. */
  logo: LogoStyle;
  /** Optional editorial treatments. */
  features?: ThemeFeatures;
}
