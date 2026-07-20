import type { Theme } from "./types";

/**
 * Verve — a music & pop-culture title (Rolling Stone / Pitchfork). Bold on
 * white: an electric-violet brand with a magenta charge and an amber pop, an
 * expressive Syne display, a boxed flag, over a loud mosaic. Poster-loud, alive.
 */
export const verve: Theme = {
  name: "verve",
  label: "Verve",
  description: "Music & culture mosaic: electric violet + magenta + amber, expressive Syne display.",
  colorScheme: "light",
  colors: {
    background: "#ffffff",
    surface: "#f4f2f7",
    surfaceAlt: "#ece7f2",
    foreground: "#14101c",
    muted: "#665f75",
    border: "#e6e1ee",
    primary: "#6d28d9", // electric violet
    primaryForeground: "#ffffff",
    secondary: "#db2777", // magenta
    accent: "#d97706", // amber pop
    link: "#6d28d9",
    heading: "#14101c",
    kicker: "#b81d63", // darkened magenta for AA
    heroFrom: "#6d28d9",
    heroTo: "#db2777",
  },
  fonts: {
    display: {
      family: "'Syne', system-ui, sans-serif",
      google: { name: "Syne", weights: [600, 700, 800] },
    },
    heading: {
      family: "'Syne', system-ui, sans-serif",
      google: { name: "Syne", weights: [600, 700, 800] },
    },
    body: {
      family: "'Inter', system-ui, -apple-system, sans-serif",
      google: { name: "Inter", weights: [400, 500, 600, 700] },
    },
    mono: {
      family: "'Space Mono', ui-monospace, Menlo, monospace",
      google: { name: "Space Mono", weights: [400, 700] },
    },
  },
  radius: "0rem",
  contentWidth: "44rem",
  containerWidth: "78rem",
  home: "mosaic",
  article: "feature",
  logo: "boxed",
  features: { kickers: true, tightHeadlines: true, topRule: true },
};
