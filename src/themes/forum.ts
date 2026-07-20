import type { Theme } from "./types";

/**
 * Forum — an economics & policy research institute. Warm off-white newsprint, a
 * deep slate-teal ink with an amber pop, high-contrast Crimson Pro serif
 * headlines over a clean Source Sans body, laid out as a dense broadsheet.
 */
export const forum: Theme = {
  name: "forum",
  label: "Forum",
  description: "Economics & policy institute: warm stock, slate-teal serif, amber, broadsheet.",
  colorScheme: "light",
  colors: {
    background: "#fbfaf7",
    surface: "#f3f2ec",
    surfaceAlt: "#ece9e1",
    foreground: "#16181c",
    muted: "#585c54",
    border: "#dcd7cb",
    primary: "#12303d",
    primaryForeground: "#fbfaf7",
    secondary: "#0c5f6e",
    accent: "#c19a00",
    link: "#0b5563",
    heading: "#16181c",
    kicker: "#12303d",
    heroFrom: "#12303d",
    heroTo: "#1c4a5c",
  },
  fonts: {
    display: {
      family: "'Crimson Pro', Georgia, 'Times New Roman', serif",
      google: { name: "Crimson Pro", weights: [600, 700, 800], italic: true },
    },
    heading: {
      family: "'Crimson Pro', Georgia, serif",
      google: { name: "Crimson Pro", weights: [600, 700] },
    },
    body: {
      family: "'Source Sans 3', system-ui, -apple-system, sans-serif",
      google: { name: "Source Sans 3", weights: [400, 600, 700] },
    },
    mono: {
      family: "'IBM Plex Mono', ui-monospace, Menlo, monospace",
      google: { name: "IBM Plex Mono", weights: [400, 600] },
    },
  },
  radius: "0rem",
  contentWidth: "44rem",
  containerWidth: "72rem",
  home: "broadsheet",
  article: "editorial",
  logo: "serif",
  features: { kickers: true, rules: true, topRule: true },
};
