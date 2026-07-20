import type { Theme } from "./types";

/**
 * Cobalt — an enterprise cloud & IT engineering blog. A restrained carbon-dark
 * console (not neon) with an electric-blue brand and a teal signal, the full
 * IBM Plex family and a monospace flag. Reads like a serious platform's docs.
 */
export const cobalt: Theme = {
  name: "cobalt",
  label: "Cobalt",
  description: "Enterprise cloud/IT: carbon-dark console, IBM Plex, blue brand, mono flag.",
  colorScheme: "dark",
  colors: {
    background: "#0b0e14",
    surface: "#151a22",
    surfaceAlt: "#1c222c",
    foreground: "#e6e9ef",
    muted: "#98a2b3",
    border: "#283040",
    primary: "#4589ff",
    primaryForeground: "#0b0e14",
    secondary: "#78a9ff",
    accent: "#2dd4bf",
    link: "#78a9ff",
    heading: "#f4f6fa",
    kicker: "#2dd4bf",
    heroFrom: "#0043ce",
    heroTo: "#08bdba",
  },
  fonts: {
    display: {
      family: "'IBM Plex Sans', system-ui, 'Helvetica Neue', sans-serif",
      google: { name: "IBM Plex Sans", weights: [600, 700] },
    },
    heading: {
      family: "'IBM Plex Sans', system-ui, 'Helvetica Neue', sans-serif",
      google: { name: "IBM Plex Sans", weights: [500, 600, 700] },
    },
    body: {
      family: "'IBM Plex Sans', system-ui, -apple-system, sans-serif",
      google: { name: "IBM Plex Sans", weights: [400, 500, 600, 700] },
    },
    mono: {
      family: "'IBM Plex Mono', ui-monospace, Menlo, monospace",
      google: { name: "IBM Plex Mono", weights: [400, 500, 700] },
    },
  },
  radius: "0.25rem",
  contentWidth: "44rem",
  containerWidth: "74rem",
  home: "grid",
  article: "standard",
  logo: "mono",
  features: { kickers: true, uppercaseNav: true, topRule: true },
};
