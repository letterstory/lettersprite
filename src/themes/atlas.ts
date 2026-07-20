import type { Theme } from "./types";

/**
 * Atlas — a travel & exploration title (National Geographic / Condé Nast
 * Traveler). Warm ochre and deep-sea teal on soft ivory, a condensed Oswald
 * masthead over an elegant Playfair display, and an image-first gallery front.
 */
export const atlas: Theme = {
  name: "atlas",
  label: "Atlas",
  description: "Travel gallery: warm ochre + sea teal, Playfair display, image-first masonry.",
  colorScheme: "light",
  colors: {
    background: "#fdfcf9",
    surface: "#f1eee6",
    surfaceAlt: "#e8e3d6",
    foreground: "#23201b",
    muted: "#675f52",
    border: "#ddd6c7",
    primary: "#b45f1c", // darkened ochre/terracotta for AA
    primaryForeground: "#ffffff",
    secondary: "#2f6b5f", // deep sea teal
    accent: "#d99a2b", // gold
    link: "#a85718",
    heading: "#23201b",
    kicker: "#2f6b5f",
    heroFrom: "#2f6b5f",
    heroTo: "#b45f1c",
  },
  fonts: {
    display: {
      family: "'Playfair Display', Georgia, serif",
      google: { name: "Playfair Display", weights: [500, 700, 800], italic: true },
    },
    heading: {
      family: "'Oswald', 'Arial Narrow', system-ui, sans-serif",
      google: { name: "Oswald", weights: [500, 600, 700] },
    },
    body: {
      family: "'Spectral', Georgia, serif",
      google: { name: "Spectral", weights: [400, 500, 600], italic: true },
    },
    mono: {
      family: "'IBM Plex Mono', ui-monospace, Menlo, monospace",
      google: { name: "IBM Plex Mono", weights: [400, 600] },
    },
  },
  radius: "0.25rem",
  contentWidth: "44rem",
  containerWidth: "78rem",
  home: "gallery",
  article: "feature",
  logo: "condensed",
  features: { kickers: true, dropCap: true },
};
