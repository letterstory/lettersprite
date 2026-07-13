import type { Theme } from "./types";

/**
 * Atelier — a warm-paper culture & lifestyle quarterly. Sophisticated Fraunces
 * display on oatmeal paper, muted taupe/forest/terracotta palette, a centered
 * flag and lots of air.
 */
export const atelier: Theme = {
  name: "atelier",
  label: "Atelier",
  description: "Warm-paper lifestyle quarterly: elegant Fraunces serif, muted palette, airy grid.",
  colorScheme: "light",
  colors: {
    background: "#f4f0e8",
    surface: "#fbf9f3",
    surfaceAlt: "#eae3d4",
    foreground: "#2b2723",
    muted: "#6b6257", // darkened for AA over the warm paper + lighter surface
    border: "#ded7c7",
    primary: "#7c6a52",
    primaryForeground: "#fbf9f3",
    secondary: "#3e4a42",
    accent: "#b04a2f",
    link: "#b04a2f",
    heading: "#2b2723",
    kicker: "#7c6a52",
    heroFrom: "#3e4a42",
    heroTo: "#7c6a52",
  },
  fonts: {
    display: {
      family: "'Fraunces', Georgia, serif",
      google: { name: "Fraunces", weights: [400, 500, 600, 800, 900], italic: true },
    },
    heading: {
      family: "'Fraunces', Georgia, serif",
      google: { name: "Fraunces", weights: [500, 600, 700] },
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
  contentWidth: "42rem",
  containerWidth: "68rem",
  home: "grid",
  article: "feature",
  logo: "serif",
  features: { kickers: true, dropCap: true, centeredMasthead: true },
};
