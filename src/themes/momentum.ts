import type { Theme } from "./types";

/**
 * Momentum — a marketing, brand & growth publication. A confident electric-blue
 * brand with an orange pop on crisp white, heavy Red Hat Display headlines in a
 * boxed flag, over a cinematic hero and card grid. Punchy but corporate.
 */
export const momentum: Theme = {
  name: "momentum",
  label: "Momentum",
  description: "Marketing & brand: electric-blue boxed flag, orange pop, cinematic hero.",
  colorScheme: "light",
  colors: {
    background: "#ffffff",
    surface: "#f4f5f7",
    surfaceAlt: "#ebedf1",
    foreground: "#0d1117",
    muted: "#565d68",
    border: "#e3e6eb",
    primary: "#1d4ed8",
    primaryForeground: "#ffffff",
    secondary: "#111827",
    accent: "#ea580c",
    link: "#1d4ed8",
    heading: "#0d1117",
    kicker: "#1d4ed8",
    heroFrom: "#1d4ed8",
    heroTo: "#6d28d9",
  },
  fonts: {
    display: {
      family: "'Red Hat Display', system-ui, 'Helvetica Neue', sans-serif",
      google: { name: "Red Hat Display", weights: [700, 800, 900] },
    },
    heading: {
      family: "'Red Hat Display', system-ui, 'Helvetica Neue', sans-serif",
      google: { name: "Red Hat Display", weights: [600, 700, 800] },
    },
    body: {
      family: "'Red Hat Text', system-ui, -apple-system, sans-serif",
      google: { name: "Red Hat Text", weights: [400, 500, 600, 700] },
    },
    mono: {
      family: "'Red Hat Mono', ui-monospace, Menlo, monospace",
      google: { name: "Red Hat Mono", weights: [400, 700] },
    },
  },
  radius: "0.5rem",
  contentWidth: "44rem",
  containerWidth: "78rem",
  home: "glossy",
  article: "feature",
  logo: "boxed",
  features: { kickers: true, tightHeadlines: true, topRule: true },
};
