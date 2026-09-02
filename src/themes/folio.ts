import type { Theme } from "./types";

/**
 * Folio — a design-magazine editorial look for HammerFin (finance-ops tools),
 * modelled on grafill.no: Caslon serif headlines + wordmark, thin-bordered
 * cards, circular cropped imagery, centered serif callouts with underlined
 * links, an asymmetric grid, occasional dark cards, and mint date chips —
 * rendered in HammerFin's own emerald / cyan / yellow / mint palette.
 *
 * Fonts (free / Google): Libre Caslon Text (a real Caslon revival — stands in
 * for grafill's Adobe Caslon Pro) for display/headings, Inter for body/labels
 * (stands in for Graphik), IBM Plex Mono for small meta. Serif is enabled via
 * `allowSerif`.
 */
export const folio: Theme = {
  name: "folio",
  label: "Folio",
  description:
    "Design-magazine editorial (grafill-style): Inter, bordered cards, circular imagery, mint/emerald.",
  colorScheme: "light",
  colors: {
    background: "#f3f8f5", // pale mint-white ground
    surface: "#ffffff",
    surfaceAlt: "#eaf3ee", // pale mint band
    foreground: "#1c2b24",
    muted: "#5c6b62",
    border: "#d3e0d8",
    primary: "#1a7f5a", // HammerFin emerald
    primaryForeground: "#ffffff",
    secondary: "#44a8c1", // cyan
    accent: "#f0e033", // yellow
    link: "#1a7f5a",
    heading: "#0f2019", // dark green-black
    kicker: "#14432f",
    heroFrom: "#1a7f5a",
    heroTo: "#44a8c1",
  },
  // HammerFin's own fonts: Inter (headlines + body) + IBM Plex Mono.
  fonts: {
    display: {
      family: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
      google: { name: "Inter", weights: [400, 500, 600, 700, 800] },
    },
    heading: {
      family: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
      google: { name: "Inter", weights: [400, 500, 600, 700, 800] },
    },
    body: {
      family: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
      google: { name: "Inter", weights: [400, 500, 600, 700] },
    },
    mono: {
      family: "'IBM Plex Mono', ui-monospace, Menlo, monospace",
      google: { name: "IBM Plex Mono", weights: [400, 600] },
    },
  },
  radius: "0.125rem",
  contentWidth: "44rem",
  containerWidth: "84rem",
  home: "folio",
  article: "feature",
  logo: "sans-bold",
  features: {
    kickers: true,
    rules: true,
    folioMasthead: true,
    folioLists: true,
    stockCovers: true,
  },
};
