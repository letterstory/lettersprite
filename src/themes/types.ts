/**
 * A Theme is a self-contained bundle of design tokens plus a layout choice.
 * Themes are plain data (no React), committed to the repo, and selected at
 * runtime by the `THEME` environment variable. Adding a new theme is just a
 * new file in this directory registered in `index.ts`.
 */

/** How the blog index arranges posts. */
export type LayoutVariant = "list" | "grid" | "magazine";

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
  };
}

/** Semantic color tokens. Every surface in the UI maps to one of these. */
export interface ThemeColors {
  /** Page background. */
  background: string;
  /** Slightly raised surfaces: cards, code blocks, footer. */
  surface: string;
  /** Primary body text. */
  foreground: string;
  /** Secondary/de-emphasised text: dates, captions. */
  muted: string;
  /** Hairlines and dividers. */
  border: string;
  /** Accent for buttons, tags, and highlights. */
  primary: string;
  /** Text/icon color placed on top of `primary`. */
  primaryForeground: string;
  /** Inline link color in article content. Defaults to `primary`. */
  link?: string;
  /** Heading color (h1–h6). Defaults to `foreground`. */
  heading?: string;
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
    body: FontSpec;
    heading: FontSpec;
    mono: FontSpec;
  };
  /** Border radius applied to cards, images and buttons, e.g. "0.5rem". */
  radius: string;
  /** Reading measure for article bodies, e.g. "44rem". */
  contentWidth: string;
  /** Outer container width for index/grid layouts, e.g. "72rem". */
  containerWidth: string;
  /** How the post index is laid out. */
  layout: LayoutVariant;
}
