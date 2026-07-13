import type { Theme } from "./types";

/**
 * Gazette — a digital broadsheet in the tradition of the paper of record.
 * Near-black ink on newsprint white, a towering serif flag, hairline rules
 * everywhere, and blue-gray section kickers.
 */
export const gazette: Theme = {
  name: "gazette",
  label: "Gazette",
  description: "Authoritative broadsheet: serif flag, hairline rules, blue-gray kickers.",
  colorScheme: "light",
  colors: {
    background: "#ffffff",
    surface: "#f7f7f7",
    surfaceAlt: "#f0f0f0",
    foreground: "#121212",
    muted: "#5a5a5a",
    border: "#dcdcdc",
    primary: "#121212",
    primaryForeground: "#ffffff",
    secondary: "#326891",
    accent: "#567b95",
    link: "#326891",
    heading: "#121212",
    kicker: "#567b95",
    heroFrom: "#121212",
    heroTo: "#121212",
  },
  fonts: {
    display: {
      family: "'Playfair Display', Georgia, 'Times New Roman', serif",
      google: { name: "Playfair Display", weights: [400, 700, 800, 900] },
    },
    heading: {
      family: "'Libre Franklin', system-ui, 'Helvetica Neue', sans-serif",
      google: { name: "Libre Franklin", weights: [400, 600, 700, 800] },
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
  radius: "0rem",
  contentWidth: "44rem",
  containerWidth: "72rem",
  home: "broadsheet",
  article: "editorial",
  logo: "serif",
  features: { kickers: true, rules: true, topRule: true },
};
