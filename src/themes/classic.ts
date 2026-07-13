import type { Theme } from "./types";

/** Warm editorial serif on paper: an elegant single column with a rust accent. */
export const classic: Theme = {
  name: "classic",
  label: "Classic",
  description: "Warm editorial serif, single-column longform, rust accent.",
  colorScheme: "light",
  colors: {
    background: "#fffdf7",
    surface: "#f3efe6",
    surfaceAlt: "#efe9dd",
    foreground: "#23201a",
    muted: "#655f52", // darkened for AA over paper + surface
    border: "#e6ded0",
    primary: "#9a3412",
    primaryForeground: "#fffdf7",
    secondary: "#57534e",
    accent: "#b45309",
    link: "#9a3412",
    heading: "#1c1710",
    kicker: "#9a3412",
    heroFrom: "#1c1710",
    heroTo: "#3a3128",
  },
  fonts: {
    display: {
      family: "'Playfair Display', Georgia, serif",
      google: { name: "Playfair Display", weights: [400, 700, 800] },
    },
    heading: {
      family: "'Playfair Display', Georgia, serif",
      google: { name: "Playfair Display", weights: [600, 700] },
    },
    body: {
      family: "'Lora', Georgia, 'Times New Roman', serif",
      google: { name: "Lora", weights: [400, 500, 600, 700], italic: true },
    },
    mono: {
      family: "'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace",
      google: { name: "JetBrains Mono", weights: [400, 700] },
    },
  },
  radius: "0.375rem",
  contentWidth: "42rem",
  containerWidth: "58rem",
  home: "column",
  article: "editorial",
  logo: "serif",
  features: { kickers: true, dropCap: true, rules: true },
};
