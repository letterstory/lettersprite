import type { Theme } from "./types";

/**
 * Beacon — a professional-services & advisory insights desk. A distinctive
 * burgundy brand against warm charcoal on white, condensed Chivo section
 * headings over a Source Serif body, in an authoritative thumbnail feed.
 */
export const beacon: Theme = {
  name: "beacon",
  label: "Beacon",
  description: "Advisory & professional services: burgundy brand, condensed Chivo, serif feed.",
  colorScheme: "light",
  colors: {
    background: "#ffffff",
    surface: "#f5f4f3",
    surfaceAlt: "#ece9e7",
    foreground: "#1a1614",
    muted: "#615d59",
    border: "#e4e0dd",
    primary: "#7a1f2b",
    primaryForeground: "#ffffff",
    secondary: "#3f3a38",
    accent: "#a8631f",
    link: "#7a1f2b",
    heading: "#1a1614",
    kicker: "#7a1f2b",
    heroFrom: "#7a1f2b",
    heroTo: "#3a0f17",
  },
  fonts: {
    display: {
      family: "'Chivo', system-ui, 'Helvetica Neue', sans-serif",
      google: { name: "Chivo", weights: [700, 800, 900] },
    },
    heading: {
      family: "'Chivo', system-ui, 'Helvetica Neue', sans-serif",
      google: { name: "Chivo", weights: [600, 700] },
    },
    body: {
      family: "'Source Serif 4', Georgia, serif",
      google: { name: "Source Serif 4", weights: [400, 600, 700] },
    },
    mono: {
      family: "'IBM Plex Mono', ui-monospace, Menlo, monospace",
      google: { name: "IBM Plex Mono", weights: [400, 600] },
    },
  },
  radius: "0.25rem",
  contentWidth: "44rem",
  containerWidth: "74rem",
  home: "feed",
  article: "standard",
  logo: "condensed",
  features: { kickers: true, rules: true, uppercaseNav: true, topRule: true },
};
