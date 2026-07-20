import type { Theme } from "./types";

/**
 * Pulse — a DevOps, observability & infrastructure publication. A signal-orange
 * brand against slate on white, condensed Barlow headlines over a clean Inter
 * body, in a bold asymmetric mosaic. Dashboard energy for platform teams.
 */
export const pulse: Theme = {
  name: "pulse",
  label: "Pulse",
  description: "DevOps & observability: signal-orange on slate, condensed headlines, mosaic.",
  colorScheme: "light",
  colors: {
    background: "#ffffff",
    surface: "#f7f6f4",
    surfaceAlt: "#efece8",
    foreground: "#14120f",
    muted: "#6a655f",
    border: "#ebe7e2",
    primary: "#ea580c",
    primaryForeground: "#1f1f1f",
    secondary: "#24201c",
    accent: "#f97316",
    link: "#b23c0b",
    heading: "#14120f",
    kicker: "#b23c0b",
    heroFrom: "#f97316",
    heroTo: "#c2410c",
  },
  fonts: {
    display: {
      family: "'Barlow Semi Condensed', 'Arial Narrow', system-ui, sans-serif",
      google: { name: "Barlow Semi Condensed", weights: [700, 800] },
    },
    heading: {
      family: "'Barlow Semi Condensed', 'Arial Narrow', system-ui, sans-serif",
      google: { name: "Barlow Semi Condensed", weights: [600, 700, 800] },
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
  radius: "0.375rem",
  contentWidth: "46rem",
  containerWidth: "78rem",
  home: "mosaic",
  article: "feature",
  logo: "condensed",
  features: { kickers: true, tightHeadlines: true, uppercaseNav: true, topRule: true },
};
