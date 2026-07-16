import type { Theme } from "./types";

/**
 * Cinder — a gaming & esports title (IGN / Polygon energy). Deep violet-black,
 * an electric-violet brand with a hot-pink and mint-green charge, condensed
 * Rajdhani headlines, a boxed flag, on a bold asymmetric mosaic. Aggressive, neon.
 */
export const cinder: Theme = {
  name: "cinder",
  label: "Cinder",
  description: "Gaming & esports: violet-black, electric violet/pink/mint, condensed mosaic.",
  colorScheme: "dark",
  colors: {
    background: "#0c0a12",
    surface: "#171320",
    surfaceAlt: "#201931",
    foreground: "#eee9f5",
    muted: "#9b93ad",
    border: "#2a2340",
    primary: "#8b3bff", // electric violet
    primaryForeground: "#ffffff",
    secondary: "#ff2e63", // hot pink-red
    accent: "#00f0b5", // mint pop
    link: "#b98bff", // lightened violet stays legible on the dark canvas
    heading: "#ffffff",
    kicker: "#00f0b5",
    heroFrom: "#8b3bff",
    heroTo: "#ff2e63",
  },
  fonts: {
    display: {
      family: "'Rajdhani', 'Arial Narrow', system-ui, sans-serif",
      google: { name: "Rajdhani", weights: [500, 600, 700] },
    },
    heading: {
      family: "'Archivo', system-ui, 'Helvetica Neue', sans-serif",
      google: { name: "Archivo", weights: [700, 800, 900] },
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
  radius: "0.25rem",
  contentWidth: "44rem",
  containerWidth: "78rem",
  home: "mosaic",
  article: "feature",
  logo: "boxed",
  features: { kickers: true, tightHeadlines: true, uppercaseNav: true, topRule: true },
};
