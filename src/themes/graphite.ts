import type { Theme } from "./types";

/**
 * Graphite — a minimalist dark writing & engineering blog. Near-monochrome
 * graphite tones with a single sky-blue signal, one clean Hanken Grotesk across
 * the system, and a quiet single reading column. Restraint over neon.
 */
export const graphite: Theme = {
  name: "graphite",
  label: "Graphite",
  description: "Minimal dark writing blog: graphite monochrome, one sky signal, single column.",
  colorScheme: "dark",
  colors: {
    background: "#0c0d0f",
    surface: "#16181c",
    surfaceAlt: "#1c1f24",
    foreground: "#e6e7ea",
    muted: "#9ba1ab",
    border: "#262a30",
    primary: "#e5e7eb",
    primaryForeground: "#0c0d0f",
    secondary: "#cbd5e1",
    accent: "#38bdf8",
    link: "#56c7fb",
    heading: "#f4f5f7",
    kicker: "#56c7fb",
    heroFrom: "#21262e",
    heroTo: "#0c0d0f",
  },
  fonts: {
    display: {
      family: "'Hanken Grotesk', system-ui, -apple-system, 'Segoe UI', sans-serif",
      google: { name: "Hanken Grotesk", weights: [600, 700, 800] },
    },
    heading: {
      family: "'Hanken Grotesk', system-ui, -apple-system, 'Segoe UI', sans-serif",
      google: { name: "Hanken Grotesk", weights: [500, 600, 700] },
    },
    body: {
      family: "'Hanken Grotesk', system-ui, -apple-system, 'Segoe UI', sans-serif",
      google: { name: "Hanken Grotesk", weights: [400, 500, 600, 700] },
    },
    mono: {
      family: "'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace",
      google: { name: "JetBrains Mono", weights: [400, 700] },
    },
  },
  radius: "0.5rem",
  contentWidth: "42rem",
  containerWidth: "60rem",
  home: "column",
  article: "standard",
  logo: "underline",
  features: { kickers: true },
};
