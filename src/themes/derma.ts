import type { Theme } from "./types";

/**
 * Derma — the editorial look built for Skin Comparisons: an "Atlantic" front
 * (centered Libre Caslon flag, symmetric three-column story grid) paired with
 * "Slate"-style section and author index pages (oversized Archivo-sans titles,
 * byline-first leads, a story river). Serif headlines on a soft violet palette.
 *
 * Fonts are split by role so the components read from theme vars, never
 * hardcoded families:
 *  - display  → Libre Caslon Text (serif) — the flag and every story headline.
 *  - heading  → Archivo (heavy sans) — section titles, kickers, bylines, nav.
 *  - body     → Inter.
 *
 * Enabled by `THEME=derma` (currently only the Skin Comparisons deployment).
 * The serif is allowed via `features.allowSerif` — signed off for this site.
 */
export const derma: Theme = {
  name: "derma",
  label: "Derma",
  description:
    "Editorial skin/beauty desk: Atlantic front + Slate section pages, Caslon serif headlines, violet palette.",
  colorScheme: "light",
  colors: {
    background: "#faf9fc",
    surface: "#efe9f6",
    surfaceAlt: "#e7dff2",
    foreground: "#33303a",
    muted: "#6c6676",
    border: "#e2dcec",
    primary: "#7c3aed",
    primaryForeground: "#ffffff",
    secondary: "#06b6d4",
    accent: "#c026d3",
    link: "#7c3aed",
    heading: "#241b2e",
    kicker: "#7c3aed",
    heroFrom: "#7c3aed",
    heroTo: "#06b6d4",
  },
  fonts: {
    display: {
      family: "'Libre Caslon Text', Georgia, 'Times New Roman', serif",
      google: { name: "Libre Caslon Text", weights: [400, 700], italic: true },
    },
    heading: {
      family: "'Archivo', ui-sans-serif, system-ui, sans-serif",
      google: { name: "Archivo", weights: [600, 700, 800] },
    },
    body: {
      family: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
      google: { name: "Inter", weights: [400, 500, 600, 700] },
    },
    mono: {
      family: "'IBM Plex Mono', ui-monospace, Menlo, monospace",
      google: { name: "IBM Plex Mono", weights: [400, 600] },
    },
  },
  radius: "0.25rem",
  contentWidth: "44rem",
  containerWidth: "78rem",
  home: "atlantic",
  article: "editorial",
  logo: "serif",
  features: {
    kickers: true,
    rules: true,
    topRule: true,
    tightHeadlines: true,
    atlanticMasthead: true,
    slateLists: true,
    allowSerif: true,
  },
};
