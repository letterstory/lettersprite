import type { Theme } from "./types";

/**
 * Metro — a loud city-culture magazine. Condensed display headlines, a hot-red
 * brand with a yellow pop, and a bold asymmetric mosaic front.
 */
export const metro: Theme = {
  name: "metro",
  label: "Metro",
  description: "Bold culture mosaic: condensed headlines, hot red, asymmetric grid.",
  colorScheme: "light",
  colors: {
    background: "#ffffff",
    surface: "#f4f2ee",
    surfaceAlt: "#eceae4",
    foreground: "#111111",
    muted: "#6b6b6b",
    border: "#dcd9d2",
    primary: "#d11319", // darkened for AA on white text / small kickers
    primaryForeground: "#ffffff",
    secondary: "#111111",
    accent: "#f2c200", // yellow: large fills / cover art only, never text
    link: "#c8102e",
    heading: "#111111",
    kicker: "#d11319",
    heroFrom: "#ec1c24",
    heroTo: "#b3151b",
  },
  fonts: {
    display: {
      family: "'Oswald', 'Arial Narrow', system-ui, sans-serif",
      google: { name: "Oswald", weights: [500, 600, 700] },
    },
    heading: {
      family: "'Archivo Narrow', 'Arial Narrow', system-ui, sans-serif",
      google: { name: "Archivo Narrow", weights: [600, 700] },
    },
    body: {
      family: "'Newsreader', Georgia, serif",
      google: { name: "Newsreader", weights: [400, 500, 600, 700], italic: true },
    },
    mono: {
      family: "'JetBrains Mono', ui-monospace, Menlo, monospace",
      google: { name: "JetBrains Mono", weights: [400, 700] },
    },
  },
  radius: "0rem",
  contentWidth: "44rem",
  containerWidth: "76rem",
  home: "mosaic",
  article: "feature",
  logo: "condensed",
  features: {
    kickers: true,
    tightHeadlines: true,
    uppercaseNav: true,
    topRule: true,
    dropCap: true,
  },
};
