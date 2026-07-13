import type { Theme } from "./types";

/**
 * Signal — a vivid tech-and-culture front. Near-black canvas, electric
 * purple→cyan gradients, a magenta pop, and a cinematic hero. The most
 * "designed", high-contrast theme.
 */
export const signal: Theme = {
  name: "signal",
  label: "Signal",
  description: "Vivid dark tech-culture: purple→cyan gradients, cinematic hero.",
  colorScheme: "dark",
  colors: {
    background: "#08080b",
    surface: "#14141b",
    surfaceAlt: "#1b1b24",
    foreground: "#f4f4f6",
    muted: "#9a9aa6",
    border: "#2a2a34",
    primary: "#7c1fff",
    primaryForeground: "#ffffff",
    secondary: "#00e5ff",
    accent: "#ff0080",
    link: "#00e5ff",
    heading: "#ffffff",
    kicker: "#ff0080",
    heroFrom: "#7c1fff",
    heroTo: "#00e5ff",
  },
  fonts: {
    display: {
      family: "'Archivo', system-ui, 'Helvetica Neue', sans-serif",
      google: { name: "Archivo", weights: [700, 800, 900] },
    },
    heading: {
      family: "'Archivo', system-ui, 'Helvetica Neue', sans-serif",
      google: { name: "Archivo", weights: [600, 700, 800] },
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
  radius: "0.75rem",
  contentWidth: "44rem",
  containerWidth: "78rem",
  home: "glossy",
  article: "feature",
  logo: "boxed",
  features: { kickers: true, dropCap: true, tightHeadlines: true, topRule: true },
};
