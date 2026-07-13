import type { Theme } from "./types";

/** Bold glossy magazine: a cinematic hero over a grid, display serif, red accent. */
export const magazine: Theme = {
  name: "magazine",
  label: "Magazine",
  description: "Cinematic hero over a bold grid, display-serif headlines, red.",
  colorScheme: "light",
  colors: {
    background: "#ffffff",
    surface: "#f5f5f4",
    surfaceAlt: "#eeeeec",
    foreground: "#1c1917",
    muted: "#6b645f", // darkened for AA over surface bands
    border: "#e7e5e4",
    primary: "#dc2626",
    primaryForeground: "#ffffff",
    secondary: "#1c1917",
    accent: "#f59e0b",
    link: "#b91c1c",
    heading: "#1c1917",
    kicker: "#dc2626",
    heroFrom: "#dc2626",
    heroTo: "#f59e0b",
  },
  fonts: {
    display: {
      family: "'Playfair Display', Georgia, serif",
      google: { name: "Playfair Display", weights: [700, 800, 900] },
    },
    heading: {
      family: "'Archivo', system-ui, sans-serif",
      google: { name: "Archivo", weights: [600, 700, 800] },
    },
    body: {
      family: "'IBM Plex Sans', system-ui, sans-serif",
      google: { name: "IBM Plex Sans", weights: [400, 500, 600, 700] },
    },
    mono: {
      family: "'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace",
      google: { name: "JetBrains Mono", weights: [400, 700] },
    },
  },
  radius: "0rem",
  contentWidth: "46rem",
  containerWidth: "78rem",
  home: "glossy",
  article: "feature",
  logo: "condensed",
  features: { kickers: true, dropCap: true, tightHeadlines: true, topRule: true },
};
