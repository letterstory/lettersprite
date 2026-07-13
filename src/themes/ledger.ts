import type { Theme } from "./types";

/**
 * Ledger — a business & markets desk. Deep navy authority with a bright-blue
 * link and an orange data pop, set in a tight, data-forward feed.
 */
export const ledger: Theme = {
  name: "ledger",
  label: "Ledger",
  description: "Business & markets desk: navy authority, blue links, orange pop.",
  colorScheme: "light",
  colors: {
    background: "#ffffff",
    surface: "#f4f6f9",
    surfaceAlt: "#eef2f7",
    foreground: "#0a0e17",
    muted: "#5b6472",
    border: "#dfe3ea",
    primary: "#0b1f4d",
    primaryForeground: "#ffffff",
    secondary: "#1666d4",
    accent: "#e8710a",
    link: "#1666d4",
    heading: "#0a0e17",
    kicker: "#1666d4",
    heroFrom: "#0a1834",
    heroTo: "#12275c",
  },
  fonts: {
    display: {
      family: "'Archivo', system-ui, 'Helvetica Neue', sans-serif",
      google: { name: "Archivo", weights: [600, 700, 800] },
    },
    heading: {
      family: "'Archivo', system-ui, 'Helvetica Neue', sans-serif",
      google: { name: "Archivo", weights: [600, 700, 800] },
    },
    body: {
      family: "'IBM Plex Sans', system-ui, sans-serif",
      google: { name: "IBM Plex Sans", weights: [400, 500, 600, 700] },
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
