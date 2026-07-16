import type { Theme } from "./types";

/**
 * Estate — a luxury real-estate & property title (Sotheby's Realty). Ivory
 * stock, a deep-navy brand with a bronze-gold, an elegant EB Garamond voice, a
 * centered serif flag over a cinematic hero. Upscale, spacious, aspirational.
 */
export const estate: Theme = {
  name: "estate",
  label: "Estate",
  description: "Luxury real estate: ivory + navy + gold, EB Garamond, centered flag, cinematic hero.",
  colorScheme: "light",
  colors: {
    background: "#fbfaf7",
    surface: "#f1efe8",
    surfaceAlt: "#e8e5da",
    foreground: "#1a1d24",
    muted: "#616671",
    border: "#ddd9cd",
    primary: "#1b2a4a", // deep navy
    primaryForeground: "#f5f2e9",
    secondary: "#8a6d3b", // bronze-gold
    accent: "#b08d4f", // gold
    link: "#6d5528",
    heading: "#1a1d24",
    kicker: "#7a5c2e", // darkened bronze for AA as small label text
    heroFrom: "#1a1d24",
    heroTo: "#2c3e63",
  },
  fonts: {
    display: {
      family: "'EB Garamond', Georgia, 'Times New Roman', serif",
      google: { name: "EB Garamond", weights: [500, 600, 700, 800], italic: true },
    },
    heading: {
      family: "'Jost', system-ui, -apple-system, sans-serif",
      google: { name: "Jost", weights: [400, 500, 600, 700] },
    },
    body: {
      family: "'EB Garamond', Georgia, 'Times New Roman', serif",
      google: { name: "EB Garamond", weights: [400, 500, 600], italic: true },
    },
    mono: {
      family: "'IBM Plex Mono', ui-monospace, Menlo, monospace",
      google: { name: "IBM Plex Mono", weights: [400, 600] },
    },
  },
  radius: "0rem",
  contentWidth: "44rem",
  containerWidth: "78rem",
  home: "glossy",
  article: "feature",
  logo: "serif",
  features: { kickers: true, centeredMasthead: true },
};
