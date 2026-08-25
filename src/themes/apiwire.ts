import type { Theme } from "./types";

/**
 * API Wire — the dark developer-publication look for AllAboutAPIs: a hybrid of
 * the editorial front (a big lead) and the news-portal river (dense image-left
 * rows with colored, monospace category tags) on near-black with warm
 * orange/gold accents carried over from the brand's retro illustrations.
 *
 * Fonts: Space Grotesk (techy display/headings), IBM Plex Sans (body), IBM Plex
 * Mono (category tags, labels — the "code" voice).
 */
export const apiwire: Theme = {
  name: "apiwire",
  label: "API Wire",
  description: "Dark developer news-portal: Space Grotesk + Plex, orange/gold accents, mono category tags.",
  colorScheme: "dark",
  colors: {
    background: "#0f1117",
    surface: "#171a21",
    surfaceAlt: "#1e222c",
    foreground: "#c7ccd6",
    muted: "#7c8492",
    border: "#272c37",
    primary: "#ea5a1f",
    primaryForeground: "#ffffff",
    secondary: "#f5b32e",
    accent: "#2dd4bf",
    link: "#f5b32e",
    heading: "#f2f4ff",
    kicker: "#ea5a1f",
    heroFrom: "#ea5a1f",
    heroTo: "#f5b32e",
  },
  // Sci-fi/technical display: Chakra Petch for headlines, Inter for body,
  // Space Mono for labels.
  fonts: {
    display: {
      family: "'Chakra Petch', 'Space Grotesk', ui-sans-serif, system-ui, sans-serif",
      google: { name: "Chakra Petch", weights: [500, 600, 700] },
    },
    heading: {
      family: "'Chakra Petch', 'Space Grotesk', ui-sans-serif, system-ui, sans-serif",
      google: { name: "Chakra Petch", weights: [500, 600, 700] },
    },
    body: {
      family: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
      google: { name: "Inter", weights: [400, 500, 600, 700], italic: true },
    },
    mono: {
      family: "'Space Mono', ui-monospace, Menlo, monospace",
      google: { name: "Space Mono", weights: [400, 700] },
    },
  },
  radius: "1rem",
  contentWidth: "44rem",
  containerWidth: "80rem",
  home: "wire",
  article: "standard",
  logo: "mono",
  features: {
    kickers: true,
    rules: true,
    wireMasthead: true,
    wireLists: true,
  },
};
