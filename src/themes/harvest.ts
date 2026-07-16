import type { Theme } from "./types";

/**
 * Harvest — a food & recipe magazine (Bon Appétit). Cream stock, a paprika-red
 * brand with herb-green and honey supports, a warm Fraunces display over a clean
 * Mulish body, on a bold appetizing mosaic. Big photography, generous, hungry.
 */
export const harvest: Theme = {
  name: "harvest",
  label: "Harvest",
  description: "Food & recipe mosaic: cream stock, paprika + herb + honey, warm Fraunces display.",
  colorScheme: "light",
  colors: {
    background: "#fffaf2",
    surface: "#f7eede",
    surfaceAlt: "#f0e3cd",
    foreground: "#2a201a",
    muted: "#6f6152",
    border: "#ecdfca",
    primary: "#c1440e", // paprika
    primaryForeground: "#ffffff",
    secondary: "#3f6b3a", // herb green
    accent: "#b5701a", // honey (darkened to stay legible as small text)
    link: "#b03d0c",
    heading: "#2a201a",
    kicker: "#3f6b3a",
    heroFrom: "#c1440e",
    heroTo: "#d98a20",
  },
  fonts: {
    display: {
      family: "'Fraunces', Georgia, serif",
      google: { name: "Fraunces", weights: [500, 700, 800], italic: true },
    },
    heading: {
      family: "'Fraunces', Georgia, serif",
      google: { name: "Fraunces", weights: [500, 600, 700] },
    },
    body: {
      family: "'Mulish', system-ui, -apple-system, 'Segoe UI', sans-serif",
      google: { name: "Mulish", weights: [400, 500, 600, 700] },
    },
    mono: {
      family: "'Space Mono', ui-monospace, Menlo, monospace",
      google: { name: "Space Mono", weights: [400, 700] },
    },
  },
  radius: "0.5rem",
  contentWidth: "44rem",
  containerWidth: "78rem",
  home: "mosaic",
  article: "feature",
  logo: "serif",
  features: { kickers: true, tightHeadlines: true, dropCap: true },
};
