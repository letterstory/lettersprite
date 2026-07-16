import type { Theme } from "./types";

/**
 * Lumen — a science & ideas title (Quanta / Nautilus). A cool near-white, an
 * indigo-ink brand with a discovery-cyan support and an orange spark, a literary
 * Spectral serif under IBM Plex Sans labels, on a fast feature feed. Intellectual
 * but inviting.
 */
export const lumen: Theme = {
  name: "lumen",
  label: "Lumen",
  description: "Science & ideas feed: indigo ink + cyan + orange spark, Spectral serif, curious.",
  colorScheme: "light",
  colors: {
    background: "#fbfbfd",
    surface: "#f2f3f8",
    surfaceAlt: "#e9ebf3",
    foreground: "#14151f",
    muted: "#5a5f70",
    border: "#e0e2ec",
    primary: "#4338ca", // indigo ink
    primaryForeground: "#ffffff",
    secondary: "#0e7490", // discovery cyan
    accent: "#c2410c", // orange spark (darkened to read as small text)
    link: "#4338ca",
    heading: "#14151f",
    kicker: "#0e7490",
    heroFrom: "#4338ca",
    heroTo: "#0e7490",
  },
  fonts: {
    display: {
      family: "'Spectral', Georgia, serif",
      google: { name: "Spectral", weights: [500, 600, 700, 800], italic: true },
    },
    heading: {
      family: "'IBM Plex Sans', system-ui, sans-serif",
      google: { name: "IBM Plex Sans", weights: [500, 600, 700] },
    },
    body: {
      family: "'Spectral', Georgia, serif",
      google: { name: "Spectral", weights: [400, 500, 600], italic: true },
    },
    mono: {
      family: "'IBM Plex Mono', ui-monospace, Menlo, monospace",
      google: { name: "IBM Plex Mono", weights: [400, 600] },
    },
  },
  radius: "0.375rem",
  contentWidth: "44rem",
  containerWidth: "74rem",
  home: "feed",
  article: "feature",
  logo: "underline",
  features: { kickers: true, dropCap: true },
};
