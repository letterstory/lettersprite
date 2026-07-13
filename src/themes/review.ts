import type { Theme } from "./types";

/**
 * Review — a refined longform monthly. An all-Newsreader serif system on warm
 * cream, a deep-red brand, drop caps and a quiet, generous reading column.
 */
export const review: Theme = {
  name: "review",
  label: "Review",
  description: "Refined longform: warm cream, all-serif system, deep-red accent.",
  colorScheme: "light",
  colors: {
    background: "#faf8f3",
    surface: "#f2eee5",
    surfaceAlt: "#efe9dd",
    foreground: "#1a1a1a",
    muted: "#63615c", // darkened for AA over cream + surface
    border: "#ded9ce",
    primary: "#b31b1b",
    primaryForeground: "#ffffff",
    secondary: "#8a0303",
    accent: "#c8102e",
    link: "#b31b1b",
    heading: "#1a1a1a",
    kicker: "#b31b1b",
    heroFrom: "#1a1a1a",
    heroTo: "#3a3735",
  },
  fonts: {
    display: {
      family: "'Newsreader', Georgia, serif",
      google: { name: "Newsreader", weights: [400, 500, 600, 700, 800], italic: true },
    },
    heading: {
      family: "'Newsreader', Georgia, serif",
      google: { name: "Newsreader", weights: [500, 600, 700] },
    },
    body: {
      family: "'Newsreader', Georgia, serif",
      google: { name: "Newsreader", weights: [400, 500, 600, 700], italic: true },
    },
    mono: {
      family: "'IBM Plex Mono', ui-monospace, Menlo, monospace",
      google: { name: "IBM Plex Mono", weights: [400, 600] },
    },
  },
  radius: "0.125rem",
  contentWidth: "42rem",
  containerWidth: "60rem",
  home: "column",
  article: "editorial",
  logo: "serif",
  features: { kickers: true, dropCap: true, rules: true },
};
