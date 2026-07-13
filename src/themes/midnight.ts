import type { Theme } from "./types";

/** Dark editorial column: calm ink-blue canvas, soft blue + violet accents. */
export const midnight: Theme = {
  name: "midnight",
  label: "Midnight",
  description: "Dark single-column reading, soft blue and violet accents.",
  colorScheme: "dark",
  colors: {
    background: "#0b0d12",
    surface: "#161a23",
    surfaceAlt: "#1b2130",
    foreground: "#e6e9ef",
    muted: "#9aa3b2",
    border: "#232a37",
    primary: "#7aa2f7",
    primaryForeground: "#0b0d12",
    secondary: "#a78bfa",
    accent: "#34d399",
    link: "#8ab4f8",
    heading: "#f5f7fb",
    kicker: "#7aa2f7",
    heroFrom: "#7aa2f7",
    heroTo: "#a78bfa",
  },
  fonts: {
    display: {
      family: "'Space Grotesk', system-ui, sans-serif",
      google: { name: "Space Grotesk", weights: [500, 600, 700] },
    },
    heading: {
      family: "'Space Grotesk', system-ui, sans-serif",
      google: { name: "Space Grotesk", weights: [500, 600, 700] },
    },
    body: {
      family: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
      google: { name: "Inter", weights: [400, 500, 600, 700] },
    },
    mono: {
      family: "'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace",
      google: { name: "JetBrains Mono", weights: [400, 700] },
    },
  },
  radius: "0.5rem",
  contentWidth: "44rem",
  containerWidth: "66rem",
  home: "column",
  article: "standard",
  logo: "monogram",
  features: { kickers: true },
};
