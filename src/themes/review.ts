import type { Theme } from "./types";

/**
 * Review — a refined literary/academic journal. An all-Spectral serif system on
 * ivory, near-black ink with a single restrained oxblood accent, drop caps and a
 * quiet, generous reading column. Kept off `classic`'s warm-red Playfair so two
 * serif editorial titles never read as the same journal.
 */
export const review: Theme = {
  name: "review",
  label: "Review",
  description: "Literary journal: ivory paper, ink black, restrained oxblood, all-Spectral serif column.",
  colorScheme: "light",
  colors: {
    background: "#faf8f3",
    surface: "#f2eee5",
    surfaceAlt: "#efe9dd",
    foreground: "#1a1a1a",
    muted: "#63615c", // darkened for AA over cream + surface
    border: "#ded9ce",
    primary: "#23201c", // ink
    primaryForeground: "#ffffff",
    secondary: "#4a4540",
    accent: "#7a1f3d", // restrained oxblood
    link: "#7a1f3d",
    heading: "#1a1a1a",
    kicker: "#7a1f3d",
    heroFrom: "#23201c",
    heroTo: "#3a3735",
  },
  fonts: {
    display: {
      family: "'Spectral', Georgia, serif",
      google: { name: "Spectral", weights: [500, 600, 700], italic: true },
    },
    heading: {
      family: "'Spectral', Georgia, serif",
      google: { name: "Spectral", weights: [500, 600, 700] },
    },
    body: {
      family: "'Spectral', Georgia, serif",
      google: { name: "Spectral", weights: [400, 500, 600, 700], italic: true },
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
