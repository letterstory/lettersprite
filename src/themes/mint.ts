import type { Theme } from "./types";

/**
 * Mint — a consumer fintech & personal-finance blog (a modern neobank). Fresh
 * emerald with a trust-navy anchor and a gold-coin pop, rounded app-like cards,
 * a bold geometric Jakarta wordmark. Friendly, bright and confident about money.
 *
 * Uses a `sans-bold` wordmark (not a monogram tile) so it never reads as a twin
 * of `nook`, the other bright monogram-on-grid lifestyle theme.
 */
export const mint: Theme = {
  name: "mint",
  label: "Mint",
  description: "Consumer fintech: emerald + trust navy, gold pop, rounded app-like grid.",
  colorScheme: "light",
  colors: {
    background: "#ffffff",
    surface: "#f2faf6",
    surfaceAlt: "#e7f5ee",
    foreground: "#0f1f1a",
    muted: "#566b62",
    border: "#d9ece3",
    primary: "#00a878", // emerald
    primaryForeground: "#04231a", // dark ink keeps contrast on mid-green
    secondary: "#0a1f44", // trust navy
    accent: "#e0930a", // gold coin
    link: "#00785a", // darkened emerald for AA
    heading: "#0f1f1a",
    kicker: "#00785a",
    heroFrom: "#00a878",
    heroTo: "#0a1f44",
  },
  fonts: {
    display: {
      family: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
      google: { name: "Plus Jakarta Sans", weights: [600, 700, 800] },
    },
    heading: {
      family: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
      google: { name: "Plus Jakarta Sans", weights: [600, 700, 800] },
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
  radius: "0.875rem",
  contentWidth: "44rem",
  containerWidth: "74rem",
  home: "grid",
  article: "standard",
  logo: "sans-bold",
  features: { kickers: true },
};
