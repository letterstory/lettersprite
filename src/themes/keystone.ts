import type { Theme } from "./types";

/**
 * Keystone — an investment & financial-services desk. Deep forest-green
 * authority with a gold data pop, heavy Work Sans headlines over a Source Serif
 * body for gravitas, set in a tight, data-forward feed.
 */
export const keystone: Theme = {
  name: "keystone",
  label: "Keystone",
  description: "Financial services desk: forest-green authority, gold pop, serif body.",
  colorScheme: "light",
  colors: {
    background: "#ffffff",
    surface: "#f4f6f4",
    surfaceAlt: "#eaeeea",
    foreground: "#101410",
    muted: "#59615a",
    border: "#e0e4df",
    primary: "#14432f",
    primaryForeground: "#ffffff",
    secondary: "#1f6f4c",
    accent: "#b8862f",
    link: "#176046",
    heading: "#101410",
    kicker: "#14432f",
    heroFrom: "#0b2a1c",
    heroTo: "#1a5539",
  },
  fonts: {
    display: {
      family: "'Work Sans', system-ui, 'Helvetica Neue', sans-serif",
      google: { name: "Work Sans", weights: [600, 700, 800] },
    },
    heading: {
      family: "'Work Sans', system-ui, 'Helvetica Neue', sans-serif",
      google: { name: "Work Sans", weights: [600, 700, 800] },
    },
    body: {
      family: "'Source Serif 4', Georgia, serif",
      google: { name: "Source Serif 4", weights: [400, 600, 700] },
    },
    mono: {
      family: "'IBM Plex Mono', ui-monospace, Menlo, monospace",
      google: { name: "IBM Plex Mono", weights: [400, 600] },
    },
  },
  radius: "0.25rem",
  contentWidth: "44rem",
  containerWidth: "74rem",
  home: "feed",
  article: "standard",
  logo: "sans-bold",
  features: { kickers: true, rules: true, uppercaseNav: true, topRule: true },
};
