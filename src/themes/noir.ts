import type { Theme } from "./types";

/**
 * Noir — a dark developer/terminal publication. True black-green canvas, a
 * single phosphor-green accent with an amber pop, angular mono-tech type, and a
 * structured ruled feed (no cinematic hero). Deliberately distinct from
 * `signal`: different layout (feed, not glossy), a green terminal palette
 * instead of purple/cyan neon, and unified Chakra Petch display over IBM Plex
 * Sans body — so two dark tech sites never read as the same publication.
 *
 * NOTE: `name` is the stable identifier mirrored in Letterbrace's phantom theme
 * catalog — do not change it. Only the visual tokens below are re-styled.
 */
export const noir: Theme = {
  name: "noir",
  label: "Noir",
  description: "Dark developer/terminal: phosphor green on black, amber pop, angular mono-tech type, cinematic banner hero.",
  colorScheme: "dark",
  colors: {
    background: "#060a08",
    surface: "#0c1411",
    surfaceAlt: "#111a15",
    foreground: "#cdeadd",
    muted: "#6d8a7c",
    border: "#1a271f",
    primary: "#00e08a", // phosphor green
    primaryForeground: "#02140c", // dark text on neon green
    secondary: "#57f5b0",
    accent: "#f5c518", // amber pop for kickers / marks
    link: "#00e08a",
    heading: "#e9fff5",
    kicker: "#f5c518",
    heroFrom: "#00e08a",
    heroTo: "#023a28",
  },
  fonts: {
    display: {
      family: "'Chakra Petch', system-ui, sans-serif",
      google: { name: "Chakra Petch", weights: [600, 700] },
    },
    heading: {
      family: "'Chakra Petch', system-ui, sans-serif",
      google: { name: "Chakra Petch", weights: [500, 600, 700] },
    },
    body: {
      family: "'IBM Plex Sans', system-ui, -apple-system, sans-serif",
      google: { name: "IBM Plex Sans", weights: [400, 500, 600, 700] },
    },
    mono: {
      family: "'JetBrains Mono', ui-monospace, Menlo, monospace",
      google: { name: "JetBrains Mono", weights: [400, 700] },
    },
  },
  radius: "0.25rem",
  contentWidth: "44rem",
  containerWidth: "76rem",
  home: "glossy",
  article: "feature",
  logo: "mono",
  features: { kickers: true, tightHeadlines: true, topRule: true },
};
