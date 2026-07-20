import type { Theme } from "./types";

/**
 * Bloom — a beauty & skincare editorial (Glossier / Sephora editorial). Soft
 * blush white, a rose brand with a mauve-taupe support, elegant Playfair display
 * over clean Jost, a centered flag and generous air. Luxe but approachable.
 */
export const bloom: Theme = {
  name: "bloom",
  label: "Bloom",
  description: "Beauty editorial: blush paper, rose + mauve, Playfair over Jost, centered flag.",
  colorScheme: "light",
  colors: {
    background: "#fdf8f6",
    surface: "#f8ece8",
    surfaceAlt: "#f1ded8",
    foreground: "#2a1f1e",
    muted: "#79645e", // darkened for AA over blush paper + surface
    border: "#ecdcd6",
    primary: "#b93a5c", // rose
    primaryForeground: "#ffffff",
    secondary: "#7a5c52", // mauve-taupe
    accent: "#b5455f",
    link: "#a5304f",
    heading: "#2a1f1e",
    kicker: "#a5304f",
    heroFrom: "#b93a5c",
    heroTo: "#e0a5ad",
  },
  fonts: {
    display: {
      family: "'Playfair Display', Georgia, serif",
      google: { name: "Playfair Display", weights: [400, 700, 800], italic: true },
    },
    heading: {
      family: "'Jost', system-ui, -apple-system, sans-serif",
      google: { name: "Jost", weights: [400, 500, 600, 700] },
    },
    body: {
      family: "'Karla', system-ui, -apple-system, 'Segoe UI', sans-serif",
      google: { name: "Karla", weights: [400, 500, 600, 700] },
    },
    mono: {
      family: "'Space Mono', ui-monospace, Menlo, monospace",
      google: { name: "Space Mono", weights: [400, 700] },
    },
  },
  radius: "0.5rem",
  contentWidth: "42rem",
  containerWidth: "72rem",
  home: "grid",
  article: "feature",
  logo: "serif",
  features: { kickers: true, dropCap: true, centeredMasthead: true },
};
