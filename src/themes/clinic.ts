import type { Theme } from "./types";

/**
 * Clinic — a healthcare, medical & biotech title (a health system or pharma
 * brand's newsroom). Clean white with a calm medical-blue brand and a teal
 * support, friendly Figtree headlines, on a fast, trustworthy feed. Clinical,
 * reassuring, legible.
 */
export const clinic: Theme = {
  name: "clinic",
  label: "Clinic",
  description: "Healthcare feed: calm medical blue + teal, friendly Figtree, clean and trustworthy.",
  colorScheme: "light",
  colors: {
    background: "#ffffff",
    surface: "#f1f7fa",
    surfaceAlt: "#e7f1f6",
    foreground: "#0e1b26",
    muted: "#54626d",
    border: "#dbe6ee",
    primary: "#0369a1", // medical blue
    primaryForeground: "#ffffff",
    secondary: "#0f766e", // teal
    accent: "#0d9488",
    link: "#0369a1",
    heading: "#0e1b26",
    kicker: "#0f766e",
    heroFrom: "#0369a1",
    heroTo: "#0f766e",
  },
  fonts: {
    display: {
      family: "'Figtree', system-ui, -apple-system, 'Segoe UI', sans-serif",
      google: { name: "Figtree", weights: [600, 700, 800] },
    },
    heading: {
      family: "'Figtree', system-ui, -apple-system, 'Segoe UI', sans-serif",
      google: { name: "Figtree", weights: [600, 700, 800] },
    },
    body: {
      family: "'Source Sans 3', system-ui, sans-serif",
      google: { name: "Source Sans 3", weights: [400, 600, 700] },
    },
    mono: {
      family: "'IBM Plex Mono', ui-monospace, Menlo, monospace",
      google: { name: "IBM Plex Mono", weights: [400, 600] },
    },
  },
  radius: "0.5rem",
  contentWidth: "44rem",
  containerWidth: "74rem",
  home: "feed",
  article: "standard",
  logo: "sans-bold",
  features: { kickers: true, rules: true, uppercaseNav: true },
};
