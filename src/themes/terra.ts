import type { Theme } from "./types";

/**
 * Terra — a sustainability & climate title (Grist / Patagonia stories). Recycled
 * -paper canvas, a forest-green brand with a water-blue support and a clay pop, a
 * warm Bitter slab, on a considered longform column. Earthy, hopeful, grounded.
 */
export const terra: Theme = {
  name: "terra",
  label: "Terra",
  description: "Sustainability longform: recycled paper, forest + water + clay, warm Bitter slab.",
  colorScheme: "light",
  colors: {
    background: "#f7f6f1",
    surface: "#ecece2",
    surfaceAlt: "#e2e2d4",
    foreground: "#1e241c",
    muted: "#5d6153",
    border: "#d7d7c7",
    primary: "#2d6a4f", // forest
    primaryForeground: "#ffffff",
    secondary: "#3a6087", // water blue
    accent: "#bc6c25", // clay
    link: "#256048",
    heading: "#1e241c",
    kicker: "#256048",
    heroFrom: "#2d6a4f",
    heroTo: "#3a6087",
  },
  fonts: {
    display: {
      family: "'Bitter', Georgia, serif",
      google: { name: "Bitter", weights: [600, 700, 800], italic: true },
    },
    heading: {
      family: "'Bitter', Georgia, serif",
      google: { name: "Bitter", weights: [600, 700] },
    },
    body: {
      family: "'Mulish', system-ui, -apple-system, 'Segoe UI', sans-serif",
      google: { name: "Mulish", weights: [400, 500, 600, 700] },
    },
    mono: {
      family: "'IBM Plex Mono', ui-monospace, Menlo, monospace",
      google: { name: "IBM Plex Mono", weights: [400, 600] },
    },
  },
  radius: "0.375rem",
  contentWidth: "42rem",
  containerWidth: "62rem",
  home: "column",
  article: "editorial",
  logo: "monogram",
  features: { kickers: true, rules: true, dropCap: true },
};
