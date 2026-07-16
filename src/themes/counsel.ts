import type { Theme } from "./types";

/**
 * Counsel — a professional-services & thought-leadership title (a law firm or
 * strategy consultancy's insights). Restrained white, a deep slate-navy brand
 * with a bronze support, a Source Serif voice under Libre Franklin subheads, on
 * a quiet longform column. Conservative, authoritative, trustworthy.
 */
export const counsel: Theme = {
  name: "counsel",
  label: "Counsel",
  description: "Professional insights: slate-navy + bronze, serif body, restrained longform column.",
  colorScheme: "light",
  colors: {
    background: "#ffffff",
    surface: "#f4f5f6",
    surfaceAlt: "#eceef0",
    foreground: "#14181f",
    muted: "#59616b",
    border: "#e0e3e7",
    primary: "#12324f", // slate navy
    primaryForeground: "#ffffff",
    secondary: "#7a5c2e", // bronze
    accent: "#9a6b2f",
    link: "#12324f",
    heading: "#14181f",
    kicker: "#7a5c2e",
    heroFrom: "#12324f",
    heroTo: "#1f4a70",
  },
  fonts: {
    display: {
      family: "'Source Serif 4', Georgia, serif",
      google: { name: "Source Serif 4", weights: [600, 700, 800], italic: true },
    },
    heading: {
      family: "'Libre Franklin', system-ui, 'Helvetica Neue', sans-serif",
      google: { name: "Libre Franklin", weights: [500, 600, 700] },
    },
    body: {
      family: "'Source Serif 4', Georgia, serif",
      google: { name: "Source Serif 4", weights: [400, 600, 700], italic: true },
    },
    mono: {
      family: "'IBM Plex Mono', ui-monospace, Menlo, monospace",
      google: { name: "IBM Plex Mono", weights: [400, 600] },
    },
  },
  radius: "0.125rem",
  contentWidth: "42rem",
  containerWidth: "62rem",
  home: "column",
  article: "editorial",
  logo: "serif",
  features: { kickers: true, rules: true },
};
