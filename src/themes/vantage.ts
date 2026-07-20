import type { Theme } from "./types";

/**
 * Vantage — a B2B SaaS product & engineering blog. A crisp Plus Jakarta Sans
 * system on white, a confident indigo brand with a teal secondary and an orange
 * pop, rounded cards on a clean uniform grid. Modern, trustworthy, shippable.
 */
export const vantage: Theme = {
  name: "vantage",
  label: "Vantage",
  description: "B2B SaaS product blog: geometric sans, indigo brand, rounded card grid.",
  colorScheme: "light",
  colors: {
    background: "#ffffff",
    surface: "#f7f7fb",
    surfaceAlt: "#f0f0f7",
    foreground: "#14141c",
    muted: "#5f5f73",
    border: "#eaeaf2",
    primary: "#4338ca",
    primaryForeground: "#ffffff",
    secondary: "#0d9488",
    accent: "#f97316",
    link: "#4338ca",
    heading: "#14141c",
    kicker: "#4338ca",
    heroFrom: "#4f46e5",
    heroTo: "#7c3aed",
  },
  fonts: {
    display: {
      family: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
      google: { name: "Plus Jakarta Sans", weights: [600, 700, 800] },
    },
    heading: {
      family: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
      google: { name: "Plus Jakarta Sans", weights: [600, 700] },
    },
    body: {
      family: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
      google: { name: "Plus Jakarta Sans", weights: [400, 500, 600, 700] },
    },
    mono: {
      family: "'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace",
      google: { name: "JetBrains Mono", weights: [400, 700] },
    },
  },
  radius: "0.75rem",
  contentWidth: "44rem",
  containerWidth: "72rem",
  home: "grid",
  article: "standard",
  logo: "monogram",
  features: { kickers: true },
};
