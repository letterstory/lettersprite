import type { Theme } from "./types";

/**
 * Bourse — a Creative Boom-style editorial magazine for Venture Capital
 * Letters: a cool porcelain canvas, a two-row masthead (wordmark row + a
 * full-width topic bar), a magazine front (hero band, "Most read", "Latest"),
 * outline category pills, and curated finance/business photography on every
 * cover (see `stockCovers`).
 *
 * Fonts (free / Google): Space Grotesk for the big display titles, Inter for
 * headlines + body, IBM Plex Mono for small labels. A burnt-sienna accent and
 * the geometric glyph carry the brand.
 */
export const bourse: Theme = {
  name: "bourse",
  label: "Bourse",
  description:
    "Light Creative Boom-style VC/finance magazine: Space Grotesk + Inter, porcelain + sienna, stock photography.",
  colorScheme: "light",
  colors: {
    background: "#eef1f4", // cool porcelain — a whisper of blue-grey, elegant
    surface: "#e5e9ee",
    surfaceAlt: "#eaedf1",
    foreground: "#191c20", // cool near-black ink
    muted: "#6a717a",
    border: "#d9dee5",
    primary: "#b5451b", // burnt sienna — the site's original brand color
    primaryForeground: "#ffffff",
    secondary: "#8c3a1a", // deep rust
    accent: "#e8a045", // amber / gold — figures and highlights
    link: "#b5451b",
    heading: "#1e1a15",
    kicker: "#b5451b",
    heroFrom: "#1e1a15",
    heroTo: "#3d2a1a",
  },
  // Free, Google-hosted faces (licensing-clean): Inter for headlines + body
  // (a near-identical stand-in for ABC Diatype), Space Grotesk for the big
  // display/section titles (stands in for Roobert).
  fonts: {
    display: {
      family: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
      google: { name: "Inter", weights: [400, 500, 600, 700] },
    },
    heading: {
      family: "'Space Grotesk', ui-sans-serif, system-ui, sans-serif",
      google: { name: "Space Grotesk", weights: [500, 600, 700] },
    },
    body: {
      family: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
      google: { name: "Inter", weights: [400, 500, 600, 700] },
    },
    mono: {
      family: "'IBM Plex Mono', ui-monospace, Menlo, monospace",
      google: { name: "IBM Plex Mono", weights: [400, 500, 600, 700] },
    },
  },
  radius: "0.25rem",
  contentWidth: "44rem",
  containerWidth: "84rem",
  home: "boom",
  article: "standard",
  logo: "sans-bold",
  features: {
    kickers: true,
    rules: true,
    boomMasthead: true,
    stockCovers: true,
  },
};
