import type { Theme } from "./types";

/**
 * The base theme — the canonical look of the blog, and the template for new
 * ones. To make another theme: copy this file to `src/themes/<name>.ts`, change
 * the values, register it in `index.ts`, then select it per deployment with
 * `THEME=<name>` in the environment.
 *
 * Every field below is a knob. Any `colors` value can also be overridden per
 * deployment via the `SITE_*_COLOR` env vars (see `.env.example`).
 */
export const sleek: Theme = {
  name: "sleek",
  label: "Sleek",
  description: "Modern, minimal single column with a clean sans-serif.",

  // "light" or "dark" — keeps native form controls and scrollbars in sync.
  colorScheme: "light",

  colors: {
    background: "#ffffff", // page background
    surface: "#f6f6f7", // cards, code blocks, footer
    foreground: "#0f0f10", // body text
    muted: "#6b6b70", // dates, captions, secondary text
    border: "#ececee", // hairlines and dividers
    primary: "#4f46e5", // accent: buttons, tags, "read more"
    primaryForeground: "#ffffff", // text/icons on top of `primary`
    link: "#4f46e5", // inline links in article content
    heading: "#0f0f10", // headings (h1–h6)
  },

  fonts: {
    // `family` is the CSS stack; `google` (optional) loads the web font.
    body: {
      family: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
      google: { name: "Inter", weights: [400, 500, 600, 700] },
    },
    heading: {
      family: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
      google: { name: "Inter", weights: [600, 700, 800] },
    },
    mono: {
      family: "'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace",
      google: { name: "JetBrains Mono", weights: [400, 700] },
    },
  },

  radius: "0.625rem", // corner radius for cards, images, buttons
  contentWidth: "42rem", // reading measure for article bodies
  containerWidth: "48rem", // outer width for the index / grid
  layout: "list", // index layout: "list" | "grid" | "magazine"
};
