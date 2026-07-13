import type { Theme } from "./types";

/**
 * Chronicle — an authoritative politics & economics weekly. A crimson boxed
 * masthead, high-contrast serif headlines on warm stock, a teal counterpoint,
 * and a dense but elegant broadsheet.
 */
export const chronicle: Theme = {
  name: "chronicle",
  label: "Chronicle",
  description: "Politics & economics weekly: crimson boxed flag, serif headlines, broadsheet.",
  colorScheme: "light",
  colors: {
    background: "#fbf7f2",
    surface: "#ffffff",
    surfaceAlt: "#f5efe6",
    foreground: "#121212",
    muted: "#5c5852",
    border: "#ded8ce",
    primary: "#e3120b",
    primaryForeground: "#ffffff",
    secondary: "#0d0d0d",
    accent: "#0e6e8c",
    link: "#0e6e8c",
    heading: "#121212",
    kicker: "#e3120b",
    heroFrom: "#e3120b",
    heroTo: "#b00d08",
  },
  fonts: {
    display: {
      family: "'Newsreader', Georgia, 'Times New Roman', serif",
      google: { name: "Newsreader", weights: [400, 600, 700, 800], italic: true },
    },
    heading: {
      family: "'Source Serif 4', Georgia, serif",
      google: { name: "Source Serif 4", weights: [600, 700, 800] },
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
  logo: "boxed",
  features: { kickers: true, rules: true, topRule: true },
};
