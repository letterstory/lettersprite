import type { Theme } from "./types";

/**
 * Ledger — a business & markets desk (FT / Economist authority). Deep navy on a
 * near-white paper, a bright-blue link and an orange data pop, set as a serif
 * financial BROADSHEET with editorial long-form. Deliberately distinct from
 * `dispatch` (the green tech-news feed): a different layout, a serif nameplate
 * and headlines instead of the shared Archivo/feed/sans-bold formula.
 *
 * NOTE: `name` is the stable identifier mirrored in Letterbrace's phantom theme
 * catalog — do not change it. Only the visual tokens below are re-styled.
 */
export const ledger: Theme = {
  name: "ledger",
  label: "Ledger",
  description: "Business & markets broadsheet: navy authority, serif headlines, blue links, orange pop.",
  colorScheme: "light",
  colors: {
    background: "#fcfcfb",
    surface: "#f4f6f9",
    surfaceAlt: "#eef2f7",
    foreground: "#0a0e17",
    muted: "#5b6472",
    border: "#dfe3ea",
    primary: "#0b1f4d",
    primaryForeground: "#ffffff",
    secondary: "#1666d4",
    accent: "#e8710a",
    link: "#1666d4",
    heading: "#0a0e17",
    kicker: "#1666d4",
    heroFrom: "#0a1834",
    heroTo: "#12275c",
  },
  fonts: {
    display: {
      family: "'Source Serif 4', Georgia, 'Times New Roman', serif",
      google: { name: "Source Serif 4", weights: [600, 700], italic: true },
    },
    heading: {
      family: "'Libre Franklin', system-ui, 'Helvetica Neue', sans-serif",
      google: { name: "Libre Franklin", weights: [600, 700, 800] },
    },
    body: {
      family: "'IBM Plex Sans', system-ui, sans-serif",
      google: { name: "IBM Plex Sans", weights: [400, 500, 600, 700] },
    },
    mono: {
      family: "'IBM Plex Mono', ui-monospace, Menlo, monospace",
      google: { name: "IBM Plex Mono", weights: [400, 600] },
    },
  },
  radius: "0.125rem",
  contentWidth: "44rem",
  containerWidth: "74rem",
  home: "broadsheet",
  article: "editorial",
  logo: "serif",
  features: { kickers: true, rules: true, dropCap: true, topRule: true },
};
