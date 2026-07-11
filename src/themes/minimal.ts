import type { Theme } from "./types";

/** Monochrome card grid. Geometric sans, near-black accent, lots of whitespace. */
export const minimal: Theme = {
  name: "minimal",
  label: "Minimal",
  description: "Monochrome card grid with a modern geometric sans-serif.",
  colorScheme: "light",
  colors: {
    background: "#ffffff",
    surface: "#fafafa",
    foreground: "#0a0a0a",
    muted: "#737373",
    border: "#e5e5e5",
    primary: "#0a0a0a",
    primaryForeground: "#ffffff",
    link: "#0a0a0a",
    heading: "#0a0a0a",
  },
  fonts: {
    body: {
      family: "'Manrope', system-ui, -apple-system, 'Segoe UI', sans-serif",
      google: { name: "Manrope", weights: [400, 500, 600, 700] },
    },
    heading: {
      family: "'Manrope', system-ui, -apple-system, 'Segoe UI', sans-serif",
      google: { name: "Manrope", weights: [600, 700, 800] },
    },
    mono: {
      family: "'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace",
      google: { name: "JetBrains Mono", weights: [400, 700] },
    },
  },
  radius: "0.25rem",
  contentWidth: "44rem",
  containerWidth: "72rem",
  layout: "grid",
};
