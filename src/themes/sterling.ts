import type { Theme } from "./types";

/**
 * Sterling — a private-bank & wealth-management journal. Deep navy and gold on
 * ivory stock, an elegant EB Garamond display underlined in brand, a clean
 * Figtree body, and a generous, unhurried reading column. Quiet prestige.
 */
export const sterling: Theme = {
  name: "sterling",
  label: "Sterling",
  description: "Private banking & wealth: ivory stock, navy + gold, elegant Garamond.",
  colorScheme: "light",
  colors: {
    background: "#fbfaf6",
    surface: "#f3f1ea",
    surfaceAlt: "#ece9df",
    foreground: "#1c1a15",
    muted: "#635e4e",
    border: "#e2ded0",
    primary: "#14233b",
    primaryForeground: "#fbfaf6",
    secondary: "#7a6a44",
    accent: "#9a7b1f",
    link: "#1f3a5f",
    heading: "#1c1a15",
    kicker: "#14233b",
    heroFrom: "#14233b",
    heroTo: "#24374f",
  },
  fonts: {
    display: {
      family: "'EB Garamond', Georgia, 'Times New Roman', serif",
      google: { name: "EB Garamond", weights: [600, 700, 800], italic: true },
    },
    heading: {
      family: "'EB Garamond', Georgia, serif",
      google: { name: "EB Garamond", weights: [500, 600, 700] },
    },
    body: {
      family: "'Figtree', system-ui, -apple-system, 'Segoe UI', sans-serif",
      google: { name: "Figtree", weights: [400, 500, 600, 700] },
    },
    mono: {
      family: "'Space Mono', ui-monospace, Menlo, monospace",
      google: { name: "Space Mono", weights: [400, 700] },
    },
  },
  radius: "0.125rem",
  contentWidth: "42rem",
  containerWidth: "60rem",
  home: "column",
  article: "feature",
  logo: "underline",
  features: { kickers: true, dropCap: true, rules: true, centeredMasthead: true },
};
