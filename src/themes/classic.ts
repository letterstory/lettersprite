import type { Theme } from "./types";

/** Warm editorial serif on paper. Single column, rust accent, blue-free links. */
export const classic: Theme = {
  name: "classic",
  label: "Classic",
  description: "Editorial single column with a serif reading experience.",
  colorScheme: "light",
  colors: {
    background: "#fffdf7",
    surface: "#f3efe6",
    foreground: "#23201a",
    muted: "#6e675b",
    border: "#e6ded0",
    primary: "#9a3412",
    primaryForeground: "#ffffff",
    link: "#9a3412",
    heading: "#1c1710",
  },
  fonts: {
    body: {
      family: "'Lora', Georgia, 'Times New Roman', serif",
      google: { name: "Lora", weights: [400, 500, 600, 700] },
    },
    heading: {
      family: "'Playfair Display', Georgia, serif",
      google: { name: "Playfair Display", weights: [400, 700, 800] },
    },
    mono: {
      family: "'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace",
      google: { name: "JetBrains Mono", weights: [400, 700] },
    },
  },
  radius: "0.375rem",
  contentWidth: "42rem",
  containerWidth: "44rem",
  layout: "list",
};
