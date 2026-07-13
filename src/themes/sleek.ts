import type { Theme } from "./types";

/**
 * The clean baseline — a modern, confident startup-blog look. This is the
 * template for new themes: copy it to `src/themes/<name>.ts`, adjust the tokens,
 * register it in `index.ts`, then select it per deployment with `THEME=<name>`.
 *
 * Every field is a knob; any color can also be overridden per deployment via the
 * `SITE_*_COLOR` env vars (see `.env.example`).
 */
export const sleek: Theme = {
  name: "sleek",
  label: "Sleek",
  description: "Clean modern card grid, geometric headlines, indigo accent.",
  colorScheme: "light",

  colors: {
    background: "#ffffff",
    surface: "#f7f7f8",
    surfaceAlt: "#f1f1f4",
    foreground: "#0f0f10",
    muted: "#6b6b70",
    border: "#ececee",
    primary: "#4f46e5", // indigo brand
    primaryForeground: "#ffffff",
    secondary: "#0ea5e9", // sky
    accent: "#ec4899", // pink pop
    link: "#4f46e5",
    heading: "#0f0f10",
    kicker: "#4f46e5",
    heroFrom: "#6366f1",
    heroTo: "#8b5cf6",
  },

  fonts: {
    display: {
      family: "'Sora', system-ui, -apple-system, 'Segoe UI', sans-serif",
      google: { name: "Sora", weights: [600, 700, 800] },
    },
    heading: {
      family: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
      google: { name: "Inter", weights: [500, 600, 700, 800] },
    },
    body: {
      family: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
      google: { name: "Inter", weights: [400, 500, 600, 700] },
    },
    mono: {
      family: "'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace",
      google: { name: "JetBrains Mono", weights: [400, 700] },
    },
  },

  radius: "0.75rem",
  contentWidth: "42rem",
  containerWidth: "72rem",
  home: "grid",
  article: "standard",
  logo: "sans-bold",
  features: { kickers: true },
};
