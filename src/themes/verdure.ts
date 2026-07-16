import type { Theme } from "./types";

/**
 * Verdure — a nutrition & wellness blog. Fresh leaf-green on soft off-white, a
 * carrot/pumpkin warm counterpoint, rounded friendly cards on a browsable
 * pinboard. Reads like a food-as-medicine journal you actually want to graze.
 */
export const verdure: Theme = {
  name: "verdure",
  label: "Verdure",
  description: "Nutrition & wellness pinboard: fresh green, warm pops, rounded cards.",
  colorScheme: "light",
  colors: {
    background: "#fbfcf8",
    surface: "#eef4e8",
    surfaceAlt: "#e5efd9",
    foreground: "#1f2a1c",
    muted: "#59654f", // darkened for AA over the green-tinted paper + surface
    border: "#dde7cf",
    primary: "#3f8f4f",
    primaryForeground: "#ffffff",
    secondary: "#c2610c", // carrot — legible as small text
    accent: "#ca6a2e", // pumpkin pop
    link: "#2f7a3f",
    heading: "#1f2a1c",
    kicker: "#2f7a3f",
    heroFrom: "#52b788",
    heroTo: "#2f9e44",
  },
  fonts: {
    display: {
      family: "'Bricolage Grotesque', system-ui, sans-serif",
      google: { name: "Bricolage Grotesque", weights: [600, 700, 800] },
    },
    heading: {
      family: "'Epilogue', system-ui, -apple-system, sans-serif",
      google: { name: "Epilogue", weights: [600, 700, 800] },
    },
    body: {
      family: "'Mulish', system-ui, -apple-system, 'Segoe UI', sans-serif",
      google: { name: "Mulish", weights: [400, 500, 600, 700] },
    },
    mono: {
      family: "'JetBrains Mono', ui-monospace, Menlo, monospace",
      google: { name: "JetBrains Mono", weights: [400, 700] },
    },
  },
  radius: "1rem",
  contentWidth: "44rem",
  containerWidth: "74rem",
  home: "board",
  article: "standard",
  logo: "monogram",
  features: { kickers: true },
};
