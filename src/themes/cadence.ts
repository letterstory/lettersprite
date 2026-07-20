import type { Theme } from "./types";

/**
 * Cadence — a people, HR & future-of-work publication. An approachable teal
 * brand with a warm coral pop on white, the highly readable Lexend across the
 * whole system, and a clean card grid. Human, modern, corporate.
 */
export const cadence: Theme = {
  name: "cadence",
  label: "Cadence",
  description: "People & future of work: approachable teal, coral pop, readable Lexend grid.",
  colorScheme: "light",
  colors: {
    background: "#ffffff",
    surface: "#f4f7f7",
    surfaceAlt: "#e9f0ef",
    foreground: "#14181a",
    muted: "#5b6369",
    border: "#e2eae9",
    primary: "#0d6a6a",
    primaryForeground: "#ffffff",
    secondary: "#0f766e",
    accent: "#ee6c4d",
    link: "#0c6060",
    heading: "#14181a",
    kicker: "#0d6a6a",
    heroFrom: "#0d6a6a",
    heroTo: "#14b8a6",
  },
  fonts: {
    display: {
      family: "'Lexend', system-ui, -apple-system, 'Segoe UI', sans-serif",
      google: { name: "Lexend", weights: [600, 700, 800] },
    },
    heading: {
      family: "'Lexend', system-ui, -apple-system, 'Segoe UI', sans-serif",
      google: { name: "Lexend", weights: [600, 700, 800] },
    },
    body: {
      family: "'Lexend', system-ui, -apple-system, 'Segoe UI', sans-serif",
      google: { name: "Lexend", weights: [400, 500, 600, 700] },
    },
    mono: {
      family: "'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace",
      google: { name: "JetBrains Mono", weights: [400, 700] },
    },
  },
  radius: "0.625rem",
  contentWidth: "44rem",
  containerWidth: "72rem",
  home: "grid",
  article: "standard",
  logo: "sans-bold",
  features: { kickers: true },
};
