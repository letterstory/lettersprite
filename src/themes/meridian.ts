import type { Theme } from "./types";

/**
 * Meridian — a management-consulting insights review. Charcoal-navy authority
 * on a cool white page, a high-contrast Spectral serif for the argument and a
 * clean Public Sans body, with a brass pop reserved for prestige marks. A
 * considered single-column longform in the McKinsey Quarterly tradition.
 */
export const meridian: Theme = {
  name: "meridian",
  label: "Meridian",
  description: "Consulting thought leadership: charcoal-navy, serif argument, brass pop.",
  colorScheme: "light",
  colors: {
    background: "#ffffff",
    surface: "#f4f6f8",
    surfaceAlt: "#eceff3",
    foreground: "#14181f",
    muted: "#565e6c",
    border: "#e0e4ea",
    primary: "#1b2a41",
    primaryForeground: "#ffffff",
    secondary: "#2f5d8a",
    accent: "#a67c2e",
    link: "#2a5580",
    heading: "#14181f",
    kicker: "#1b2a41",
    heroFrom: "#14202f",
    heroTo: "#1b2a41",
  },
  fonts: {
    display: {
      family: "'Spectral', Georgia, 'Times New Roman', serif",
      google: { name: "Spectral", weights: [600, 700, 800], italic: true },
    },
    heading: {
      family: "'Spectral', Georgia, serif",
      google: { name: "Spectral", weights: [500, 600, 700] },
    },
    body: {
      family: "'Public Sans', system-ui, -apple-system, 'Segoe UI', sans-serif",
      google: { name: "Public Sans", weights: [400, 500, 600, 700] },
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
  features: { kickers: true, dropCap: true, rules: true },
};
