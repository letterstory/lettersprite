import type { Theme } from "./types";

/**
 * Hearth — an interior design & architecture title (Dwell / Architectural
 * Digest). Warm-concrete paper, a charcoal-stone brand with clay-taupe and a
 * brick pop, geometric Jost over literary Spectral, square corners, lots of air.
 */
export const hearth: Theme = {
  name: "hearth",
  label: "Hearth",
  description: "Interior & architecture: warm concrete, charcoal + brick, geometric Jost, airy.",
  colorScheme: "light",
  colors: {
    background: "#f6f4f1",
    surface: "#ffffff",
    surfaceAlt: "#ece8e2",
    foreground: "#23211d",
    muted: "#6c675e",
    border: "#ddd8cf",
    primary: "#4a4a45", // charcoal stone
    primaryForeground: "#f6f4f1",
    secondary: "#8a7d6b", // clay taupe
    accent: "#a8502f", // brick
    link: "#9a4529",
    heading: "#23211d",
    kicker: "#6f6252", // darker taupe for AA as small label text
    heroFrom: "#4a4a45",
    heroTo: "#8a7d6b",
  },
  fonts: {
    display: {
      family: "'Jost', system-ui, -apple-system, sans-serif",
      google: { name: "Jost", weights: [500, 600, 700] },
    },
    heading: {
      family: "'Jost', system-ui, -apple-system, sans-serif",
      google: { name: "Jost", weights: [400, 500, 600, 700] },
    },
    body: {
      family: "'Spectral', Georgia, serif",
      google: { name: "Spectral", weights: [400, 500, 600] },
    },
    mono: {
      family: "'IBM Plex Mono', ui-monospace, Menlo, monospace",
      google: { name: "IBM Plex Mono", weights: [400, 600] },
    },
  },
  radius: "0rem",
  contentWidth: "44rem",
  containerWidth: "76rem",
  home: "grid",
  article: "feature",
  logo: "condensed",
  features: { kickers: true, centeredMasthead: true },
};
