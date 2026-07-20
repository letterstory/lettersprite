import type { Theme } from "./types";

/**
 * Horizon — a B2B SaaS & product-marketing blog (Linear / Stripe marketing).
 * Crisp white, a confident blue→violet brand gradient with a cyan pop, a modern
 * geometric Outfit wordmark, soft corners, over a glossy gradient hero. Clean,
 * optimistic, product-forward.
 */
export const horizon: Theme = {
  name: "horizon",
  label: "Horizon",
  description: "SaaS product blog: blue→violet gradient, cyan pop, geometric Outfit, glossy hero.",
  colorScheme: "light",
  colors: {
    background: "#ffffff",
    surface: "#f6f7fb",
    surfaceAlt: "#eef0f7",
    foreground: "#0d1220",
    muted: "#585f70",
    border: "#e5e8f0",
    primary: "#2563eb", // brand blue
    primaryForeground: "#ffffff",
    secondary: "#7c3aed", // violet
    accent: "#0891b2", // cyan
    link: "#2563eb",
    heading: "#0d1220",
    kicker: "#7c3aed",
    heroFrom: "#2563eb",
    heroTo: "#7c3aed",
  },
  fonts: {
    display: {
      family: "'Outfit', system-ui, -apple-system, 'Segoe UI', sans-serif",
      google: { name: "Outfit", weights: [600, 700, 800] },
    },
    heading: {
      family: "'Outfit', system-ui, -apple-system, 'Segoe UI', sans-serif",
      google: { name: "Outfit", weights: [600, 700, 800] },
    },
    body: {
      family: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
      google: { name: "Inter", weights: [400, 500, 600, 700] },
    },
    mono: {
      family: "'JetBrains Mono', ui-monospace, Menlo, monospace",
      google: { name: "JetBrains Mono", weights: [400, 700] },
    },
  },
  radius: "1rem",
  contentWidth: "44rem",
  containerWidth: "76rem",
  home: "glossy",
  article: "feature",
  logo: "sans-bold",
  features: { kickers: true, tightHeadlines: true, topRule: true },
};
