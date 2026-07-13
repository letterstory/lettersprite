import type { Theme } from "./types";

/**
 * Dispatch — a fast tech-news feed. Utilitarian grotesque, an electric-green
 * brand, a river of thumbnail rows and a popular rail. Breaking-news energy.
 */
export const dispatch: Theme = {
  name: "dispatch",
  label: "Dispatch",
  description: "Tech-news feed: bold grotesque, electric-green brand, thumbnail river.",
  colorScheme: "light",
  colors: {
    background: "#ffffff",
    surface: "#f5f6f5",
    surfaceAlt: "#eef1ee",
    foreground: "#0a0a0a",
    muted: "#6b7280",
    border: "#e3e5e4",
    primary: "#00c805",
    primaryForeground: "#052b10", // dark text keeps contrast on bright green
    secondary: "#111827",
    accent: "#0a7a0a", // darkened greens meet AA as small text on white
    link: "#0a7a0a",
    heading: "#0a0a0a",
    kicker: "#0a7a0a",
    heroFrom: "#00c805",
    heroTo: "#008a14",
  },
  fonts: {
    display: {
      family: "'Archivo', system-ui, 'Helvetica Neue', sans-serif",
      google: { name: "Archivo", weights: [600, 700, 800, 900] },
    },
    heading: {
      family: "'Archivo', system-ui, 'Helvetica Neue', sans-serif",
      google: { name: "Archivo", weights: [600, 700, 800] },
    },
    body: {
      family: "'Source Sans 3', system-ui, sans-serif",
      google: { name: "Source Sans 3", weights: [400, 600, 700] },
    },
    mono: {
      family: "'JetBrains Mono', ui-monospace, Menlo, monospace",
      google: { name: "JetBrains Mono", weights: [400, 700] },
    },
  },
  radius: "0.25rem",
  contentWidth: "44rem",
  containerWidth: "72rem",
  home: "feed",
  article: "standard",
  logo: "sans-bold",
  features: { kickers: true, rules: true, uppercaseNav: true, topRule: true },
};
