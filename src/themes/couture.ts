import type { Theme } from "./types";

/**
 * Couture — a high-fashion title (Vogue / Vanity Fair). Stark black ink on white
 * with a single bronze-gold, a very high-contrast Bodoni display, and a
 * full-bleed magazine *cover* front. Luxurious, editorial and quiet.
 */
export const couture: Theme = {
  name: "couture",
  label: "Couture",
  description: "High-fashion cover: Bodoni display, black + bronze-gold, full-bleed front.",
  colorScheme: "light",
  colors: {
    background: "#ffffff",
    surface: "#f6f4f1",
    surfaceAlt: "#eee9e3",
    foreground: "#0c0c0c",
    muted: "#6e6862",
    border: "#e7e2db",
    primary: "#0c0c0c",
    primaryForeground: "#ffffff",
    secondary: "#7c5c3a", // bronze
    accent: "#a8804f", // gold
    link: "#7a5c34",
    heading: "#0c0c0c",
    kicker: "#7c5c3a",
    heroFrom: "#0c0c0c",
    heroTo: "#2a2a2a",
  },
  fonts: {
    display: {
      family: "'Bodoni Moda', 'Didot', Georgia, serif",
      google: { name: "Bodoni Moda", weights: [400, 700, 800], italic: true },
    },
    heading: {
      family: "'Bodoni Moda', 'Didot', Georgia, serif",
      google: { name: "Bodoni Moda", weights: [500, 700] },
    },
    body: {
      family: "'EB Garamond', Georgia, 'Times New Roman', serif",
      google: { name: "EB Garamond", weights: [400, 500, 600, 700], italic: true },
    },
    mono: {
      family: "'Space Mono', ui-monospace, Menlo, monospace",
      google: { name: "Space Mono", weights: [400, 700] },
    },
  },
  radius: "0rem",
  contentWidth: "44rem",
  containerWidth: "80rem",
  home: "cover",
  article: "feature",
  logo: "serif",
  features: { kickers: true, dropCap: true, centeredMasthead: true },
};
