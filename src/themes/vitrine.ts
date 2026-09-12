import type { Theme } from "./types";

/**
 * Vitrine — an "iconoclastic minimalism" gallery look modelled on
 * franklinazzi.fr (a Paris architecture studio): a warm off-white ground,
 * near-black neutral-grotesque type, a three-part spread masthead
 * (nav — WORDMARK — nav), a ghosted centred search, understated uppercase
 * section tabs, and a dense multi-column image grid where the pictures carry
 * the page. Monochrome by design — colour comes from the cover art and a single
 * restrained accent. Built for interfacerapi.com ("Interfacer", developer APIs),
 * so that accent is the site's own blue.
 *
 * Fonts (free / Google): Inter throughout (a neutral grotesque standing in for
 * Helvetica Neue), plus IBM Plex Mono for meta labels and code (it's a developer
 * publication). No serif — so no coercion concerns.
 */
export const vitrine: Theme = {
  name: "vitrine",
  label: "Vitrine",
  description:
    "Franklin Azzi-style minimalist gallery: warm off-white, Helvetica-neutral grotesque, dense image grid, one restrained accent.",
  colorScheme: "light",
  colors: {
    background: "#faf7f4", // warm off-white paper (Franklin Azzi)
    surface: "#ffffff",
    surfaceAlt: "#f1eee9", // faint warm panel
    foreground: "#262626", // near-black ink
    muted: "#8a857e", // warm grey
    border: "#dcd8d1", // hairline
    primary: "#2d6fff", // Interfacer brand blue (the single accent)
    primaryForeground: "#ffffff",
    secondary: "#262626",
    accent: "#2d6fff",
    link: "#2d6fff",
    heading: "#262626",
    kicker: "#2d6fff",
    heroFrom: "#262626",
    heroTo: "#4a4a4a",
  },
  fonts: {
    display: {
      family: "'Inter', system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif",
      google: { name: "Inter", weights: [400, 500, 600, 700, 800, 900] },
    },
    heading: {
      family: "'Inter', system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif",
      google: { name: "Inter", weights: [400, 500, 600, 700, 800] },
    },
    body: {
      family: "'Inter', system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif",
      google: { name: "Inter", weights: [400, 500, 600, 700] },
    },
    mono: {
      family: "'IBM Plex Mono', ui-monospace, Menlo, monospace",
      google: { name: "IBM Plex Mono", weights: [400, 500, 600] },
    },
  },
  radius: "0",
  contentWidth: "40rem",
  containerWidth: "88rem",
  home: "vitrine",
  article: "editorial",
  logo: "sans-bold",
  features: {
    kickers: true,
    rules: true,
    vitrineMasthead: true,
    vitrineLists: true,
  },
};
