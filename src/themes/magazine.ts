import type { Theme } from "./types";

/** Bold magazine: a featured hero over a grid, display serif headline, red accent. */
export const magazine: Theme = {
  name: "magazine",
  label: "Magazine",
  description: "Featured hero story over a grid, with a bold display headline.",
  colorScheme: "light",
  colors: {
    background: "#ffffff",
    surface: "#f5f5f4",
    foreground: "#1c1917",
    muted: "#78716c",
    border: "#e7e5e4",
    primary: "#dc2626",
    primaryForeground: "#ffffff",
    link: "#b91c1c",
    heading: "#1c1917",
  },
  fonts: {
    body: {
      family: "'IBM Plex Sans', system-ui, sans-serif",
      google: { name: "IBM Plex Sans", weights: [400, 500, 600, 700] },
    },
    heading: {
      family: "'Playfair Display', Georgia, serif",
      google: { name: "Playfair Display", weights: [700, 800, 900] },
    },
    mono: {
      family: "'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace",
      google: { name: "JetBrains Mono", weights: [400, 700] },
    },
  },
  radius: "0rem",
  contentWidth: "46rem",
  containerWidth: "76rem",
  layout: "magazine",
};
