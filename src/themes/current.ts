import type { Theme } from "./types";

/**
 * Current — a high-contrast tech magazine. Stark black-and-white with one
 * electric-teal signal and a red kicker, ultra-heavy grotesque headlines over a
 * serif body, on a bold card grid.
 */
export const current: Theme = {
  name: "current",
  label: "Current",
  description: "Stark black-and-white with electric teal, heavy grotesque + serif body.",
  colorScheme: "light",
  colors: {
    background: "#ffffff",
    surface: "#f4f4f4",
    surfaceAlt: "#ededed",
    foreground: "#0a0a0a",
    muted: "#6a6a6a",
    border: "#e4e4e4",
    primary: "#0a0a0a",
    primaryForeground: "#ffffff",
    secondary: "#00d3b4",
    accent: "#e0301f", // darkened red meets AA for small kicker text on white
    link: "#0a0a0a",
    heading: "#0a0a0a",
    kicker: "#e0301f",
    heroFrom: "#0a0a0a",
    heroTo: "#00d3b4",
  },
  fonts: {
    display: {
      family: "'Archivo', 'Helvetica Neue', system-ui, sans-serif",
      google: { name: "Archivo", weights: [700, 800, 900] },
    },
    heading: {
      family: "'Archivo', 'Helvetica Neue', system-ui, sans-serif",
      google: { name: "Archivo", weights: [600, 700, 800] },
    },
    body: {
      family: "'Source Serif 4', Georgia, serif",
      google: { name: "Source Serif 4", weights: [400, 600, 700] },
    },
    mono: {
      family: "'Space Mono', ui-monospace, Menlo, monospace",
      google: { name: "Space Mono", weights: [400, 700] },
    },
  },
  radius: "0rem",
  contentWidth: "44rem",
  containerWidth: "74rem",
  home: "grid",
  article: "feature",
  logo: "condensed",
  features: { kickers: true, tightHeadlines: true, uppercaseNav: true, topRule: true },
};
