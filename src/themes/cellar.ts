import type { Theme } from "./types";

/**
 * Cellar — a craft coffee & beverage journal (a roastery or winery's stories).
 * Latte-foam paper, an espresso-roast brand with an olive support and a caramel
 * pop, a tactile Zilla Slab over a Newsreader body, on a working feed. Warm,
 * handmade, artisanal.
 */
export const cellar: Theme = {
  name: "cellar",
  label: "Cellar",
  description: "Craft beverage journal: latte paper, roast + olive + caramel, tactile Zilla Slab.",
  colorScheme: "light",
  colors: {
    background: "#f7f1e8",
    surface: "#efe4d4",
    surfaceAlt: "#e6d8c2",
    foreground: "#2a1d14",
    muted: "#6c5a48",
    border: "#ddccb5",
    primary: "#7b3f1d", // espresso roast
    primaryForeground: "#f7f1e8",
    secondary: "#3f5a3a", // olive
    accent: "#a05a1d", // caramel
    link: "#7b3f1d",
    heading: "#2a1d14",
    kicker: "#8a4a20",
    heroFrom: "#2a1d14",
    heroTo: "#7b3f1d",
  },
  fonts: {
    display: {
      family: "'Zilla Slab', Georgia, serif",
      google: { name: "Zilla Slab", weights: [500, 600, 700] },
    },
    heading: {
      family: "'Zilla Slab', Georgia, serif",
      google: { name: "Zilla Slab", weights: [600, 700] },
    },
    body: {
      family: "'Newsreader', Georgia, serif",
      google: { name: "Newsreader", weights: [400, 500, 600, 700], italic: true },
    },
    mono: {
      family: "'Space Mono', ui-monospace, Menlo, monospace",
      google: { name: "Space Mono", weights: [400, 700] },
    },
  },
  radius: "0.25rem",
  contentWidth: "44rem",
  containerWidth: "74rem",
  home: "feed",
  article: "standard",
  logo: "condensed",
  features: { kickers: true, rules: true, uppercaseNav: true },
};
