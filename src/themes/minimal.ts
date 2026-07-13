import type { Theme } from "./types";

/** Monochrome card grid: near-black ink, geometric sans, lots of whitespace. */
export const minimal: Theme = {
  name: "minimal",
  label: "Minimal",
  description: "Monochrome card grid, geometric sans, generous whitespace.",
  colorScheme: "light",
  colors: {
    background: "#ffffff",
    surface: "#fafafa",
    surfaceAlt: "#f4f4f4",
    foreground: "#0a0a0a",
    muted: "#737373",
    border: "#e5e5e5",
    primary: "#0a0a0a",
    primaryForeground: "#ffffff",
    secondary: "#404040",
    accent: "#0a0a0a",
    link: "#0a0a0a",
    heading: "#0a0a0a",
    kicker: "#0a0a0a",
    heroFrom: "#0a0a0a",
    heroTo: "#404040",
  },
  fonts: {
    display: {
      family: "'Manrope', system-ui, -apple-system, 'Segoe UI', sans-serif",
      google: { name: "Manrope", weights: [700, 800] },
    },
    heading: {
      family: "'Manrope', system-ui, -apple-system, 'Segoe UI', sans-serif",
      google: { name: "Manrope", weights: [600, 700, 800] },
    },
    body: {
      family: "'Manrope', system-ui, -apple-system, 'Segoe UI', sans-serif",
      google: { name: "Manrope", weights: [400, 500, 600, 700] },
    },
    mono: {
      family: "'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace",
      google: { name: "JetBrains Mono", weights: [400, 700] },
    },
  },
  radius: "0.25rem",
  contentWidth: "44rem",
  containerWidth: "72rem",
  home: "grid",
  article: "standard",
  logo: "underline",
  features: { kickers: true },
};
