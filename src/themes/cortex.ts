import type { Theme } from "./types";

/**
 * Cortex — an AI & machine-learning research lab. A cool white page with a deep
 * iris-violet brand, expressive Bricolage Grotesque headlines over a readable
 * Literata serif body, and a cinematic hero for flagship work. Modern, rigorous.
 */
export const cortex: Theme = {
  name: "cortex",
  label: "Cortex",
  description: "AI/ML research lab: iris-violet brand, grotesque display, Literata serif body.",
  colorScheme: "light",
  colors: {
    background: "#ffffff",
    surface: "#f6f6fb",
    surfaceAlt: "#eeeef7",
    foreground: "#14141b",
    muted: "#5a5a6a",
    border: "#e9e9f2",
    primary: "#5b21b6",
    primaryForeground: "#ffffff",
    secondary: "#7c3aed",
    accent: "#06b6d4",
    link: "#6d28d9",
    heading: "#14141b",
    kicker: "#5b21b6",
    heroFrom: "#5b21b6",
    heroTo: "#7c3aed",
  },
  fonts: {
    display: {
      family: "'Bricolage Grotesque', system-ui, 'Helvetica Neue', sans-serif",
      google: { name: "Bricolage Grotesque", weights: [600, 700, 800] },
    },
    heading: {
      family: "'Bricolage Grotesque', system-ui, 'Helvetica Neue', sans-serif",
      google: { name: "Bricolage Grotesque", weights: [600, 700, 800] },
    },
    body: {
      family: "'Literata', Georgia, 'Times New Roman', serif",
      google: { name: "Literata", weights: [400, 500, 600, 700], italic: true },
    },
    mono: {
      family: "'IBM Plex Mono', ui-monospace, Menlo, monospace",
      google: { name: "IBM Plex Mono", weights: [400, 600] },
    },
  },
  radius: "0.5rem",
  contentWidth: "46rem",
  containerWidth: "78rem",
  home: "glossy",
  article: "feature",
  logo: "sans-bold",
  features: { kickers: true, dropCap: true, tightHeadlines: true },
};
