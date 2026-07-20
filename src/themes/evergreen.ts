import type { Theme } from "./types";

/**
 * Evergreen — a corporate sustainability & ESG report. Deep forest green with
 * an amber pop on warm stone paper, geometric Outfit headlines underlined in
 * brand over a sturdy Bitter slab body, on a calm uniform grid.
 */
export const evergreen: Theme = {
  name: "evergreen",
  label: "Evergreen",
  description: "Sustainability & ESG: forest green, amber pop, stone paper, Outfit + slab body.",
  colorScheme: "light",
  colors: {
    background: "#faf9f5",
    surface: "#f0efe8",
    surfaceAlt: "#e8e7dd",
    foreground: "#1a1c17",
    muted: "#5d6055",
    border: "#dddccf",
    primary: "#1f5130",
    primaryForeground: "#faf9f5",
    secondary: "#3f7a4a",
    accent: "#b07d1f",
    link: "#1f5130",
    heading: "#1a1c17",
    kicker: "#1f5130",
    heroFrom: "#163d24",
    heroTo: "#1f5130",
  },
  fonts: {
    display: {
      family: "'Outfit', system-ui, -apple-system, 'Segoe UI', sans-serif",
      google: { name: "Outfit", weights: [600, 700, 800] },
    },
    heading: {
      family: "'Outfit', system-ui, -apple-system, 'Segoe UI', sans-serif",
      google: { name: "Outfit", weights: [500, 600, 700] },
    },
    body: {
      family: "'Bitter', Georgia, 'Times New Roman', serif",
      google: { name: "Bitter", weights: [400, 500, 700] },
    },
    mono: {
      family: "'Space Mono', ui-monospace, Menlo, monospace",
      google: { name: "Space Mono", weights: [400, 700] },
    },
  },
  radius: "0.375rem",
  contentWidth: "44rem",
  containerWidth: "70rem",
  home: "grid",
  article: "standard",
  logo: "underline",
  features: { kickers: true, rules: true },
};
