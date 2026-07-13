import type { Theme } from "./types";

/**
 * Noir — a dark futuristic tech/crypto terminal. Near-black canvas, neon
 * cyan/magenta/violet accents, monospace meta with a grotesque display, and a
 * glowing cinematic hero.
 */
export const noir: Theme = {
  name: "noir",
  label: "Noir",
  description: "Dark neon terminal: cyan/magenta accents, mono meta, glowing hero.",
  colorScheme: "dark",
  colors: {
    background: "#05060a",
    surface: "#0c0f18",
    surfaceAlt: "#10131f",
    foreground: "#e4e8f2",
    muted: "#7a839a",
    border: "#1c2233",
    primary: "#00e5ff",
    primaryForeground: "#04121a", // dark text on neon cyan
    secondary: "#ff2fb9",
    accent: "#b57bff",
    link: "#00e5ff",
    heading: "#ffffff",
    kicker: "#b57bff",
    heroFrom: "#00e5ff",
    heroTo: "#ff2fb9",
  },
  fonts: {
    display: {
      family: "'Space Grotesk', system-ui, sans-serif",
      google: { name: "Space Grotesk", weights: [500, 600, 700] },
    },
    heading: {
      family: "'Chakra Petch', system-ui, sans-serif",
      google: { name: "Chakra Petch", weights: [500, 600, 700] },
    },
    body: {
      family: "'Inter', system-ui, -apple-system, sans-serif",
      google: { name: "Inter", weights: [400, 500, 600, 700] },
    },
    mono: {
      family: "'JetBrains Mono', ui-monospace, Menlo, monospace",
      google: { name: "JetBrains Mono", weights: [400, 700] },
    },
  },
  radius: "0.5rem",
  contentWidth: "44rem",
  containerWidth: "76rem",
  home: "glossy",
  article: "feature",
  logo: "mono",
  features: { kickers: true, tightHeadlines: true, topRule: true },
};
