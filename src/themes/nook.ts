import type { Theme } from "./types";

/**
 * Nook — a parenting & family-life blog. Warm cream, a friendly apricot brand
 * with a sage support and a honey pop, rounded Baloo headlines over cozy Nunito,
 * very round corners. Cheerful, approachable, homey.
 */
export const nook: Theme = {
  name: "nook",
  label: "Nook",
  description: "Parenting & family: warm cream, apricot + sage, rounded Baloo, cozy grid.",
  colorScheme: "light",
  colors: {
    background: "#fffdf9",
    surface: "#fdf2e9",
    surfaceAlt: "#fbe7d6",
    foreground: "#2b241d",
    muted: "#6e6256",
    border: "#f0e2d2",
    primary: "#d9743a", // apricot
    primaryForeground: "#2b1710", // dark ink keeps contrast on the mid apricot
    secondary: "#5b8a72", // sage
    accent: "#c9962f", // honey
    link: "#a8501e", // darkened apricot to clear AA (4.5:1) for body-size links
    heading: "#2b241d",
    kicker: "#a8501e",
    heroFrom: "#d9743a",
    heroTo: "#e8b04b",
  },
  fonts: {
    display: {
      family: "'Baloo 2', system-ui, -apple-system, sans-serif",
      google: { name: "Baloo 2", weights: [600, 700, 800] },
    },
    heading: {
      family: "'Nunito', system-ui, -apple-system, 'Segoe UI', sans-serif",
      google: { name: "Nunito", weights: [600, 700, 800] },
    },
    body: {
      family: "'Nunito', system-ui, -apple-system, 'Segoe UI', sans-serif",
      google: { name: "Nunito", weights: [400, 500, 600, 700] },
    },
    mono: {
      family: "'Space Mono', ui-monospace, Menlo, monospace",
      google: { name: "Space Mono", weights: [400, 700] },
    },
  },
  radius: "1rem",
  contentWidth: "44rem",
  containerWidth: "74rem",
  home: "grid",
  article: "standard",
  logo: "monogram",
  features: { kickers: true },
};
