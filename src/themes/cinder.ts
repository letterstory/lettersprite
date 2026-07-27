import type { Theme } from "./types";

/**
 * Cinder — a gaming & esports title (IGN / Polygon energy). Ember red-black with
 * a crimson brand and a molten gold/orange charge, condensed Rajdhani headlines,
 * a condensed flag, on a bold asymmetric mosaic. Aggressive and hot — kept off
 * the violet/pink neon of `signal` so two dark tech sites never read as twins.
 *
 * NOTE: `name` is the stable identifier mirrored in Letterbrace's phantom theme
 * catalog — do not change it. Only the visual tokens below are re-styled.
 */
export const cinder: Theme = {
  name: "cinder",
  label: "Cinder",
  description: "Gaming & esports: ember red-black, crimson/gold charge, condensed Rajdhani mosaic.",
  colorScheme: "dark",
  colors: {
    background: "#0e0809",
    surface: "#191012",
    surfaceAlt: "#221618",
    foreground: "#f2e8e6",
    muted: "#a38d8b",
    border: "#2d1e20",
    primary: "#ff2d46", // esports crimson
    primaryForeground: "#ffffff",
    secondary: "#ff6a2c", // orange charge
    accent: "#ffd23f", // molten gold pop
    link: "#ff6a5c", // lightened red stays legible on the dark canvas
    heading: "#ffffff",
    kicker: "#ffd23f",
    heroFrom: "#ff2d46",
    heroTo: "#7a0f1c",
  },
  fonts: {
    display: {
      family: "'Rajdhani', 'Arial Narrow', system-ui, sans-serif",
      google: { name: "Rajdhani", weights: [600, 700] },
    },
    heading: {
      family: "'Rajdhani', 'Arial Narrow', system-ui, sans-serif",
      google: { name: "Rajdhani", weights: [500, 600, 700] },
    },
    body: {
      family: "'Inter', system-ui, -apple-system, sans-serif",
      google: { name: "Inter", weights: [400, 500, 600, 700] },
    },
    mono: {
      family: "'Space Mono', ui-monospace, Menlo, monospace",
      google: { name: "Space Mono", weights: [400, 700] },
    },
  },
  radius: "0.25rem",
  contentWidth: "44rem",
  containerWidth: "78rem",
  home: "mosaic",
  article: "feature",
  logo: "condensed",
  features: { kickers: true, tightHeadlines: true, uppercaseNav: true, topRule: true },
};
