import type { Theme } from "./types";

/**
 * Apex — an athletic performance & fitness title. Near-black canvas, an
 * explosive volt-yellow brand with an orange-red counterpart, ultra-heavy Anton
 * headlines, and a cinematic hero. Loud, kinetic, gym-poster energy.
 */
export const apex: Theme = {
  name: "apex",
  label: "Apex",
  description: "Athletic performance: black canvas, volt + orange, ultra-heavy Anton headlines.",
  colorScheme: "dark",
  colors: {
    background: "#0a0a0b",
    surface: "#16161a",
    surfaceAlt: "#1e1e24",
    foreground: "#f2f2f4",
    muted: "#9a9aa4",
    border: "#2a2a30",
    primary: "#d7ff00", // volt
    primaryForeground: "#14160a", // dark ink on bright volt
    secondary: "#ff4d1f", // orange-red
    accent: "#ff4d1f",
    link: "#d7ff00",
    heading: "#ffffff",
    kicker: "#d7ff00",
    heroFrom: "#ff4d1f",
    heroTo: "#d7ff00",
  },
  fonts: {
    display: {
      family: "'Anton', 'Arial Narrow', system-ui, sans-serif",
      google: { name: "Anton", weights: [400] },
    },
    heading: {
      family: "'Archivo', system-ui, 'Helvetica Neue', sans-serif",
      google: { name: "Archivo", weights: [700, 800, 900] },
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
  radius: "0rem",
  contentWidth: "44rem",
  containerWidth: "78rem",
  home: "glossy",
  article: "feature",
  logo: "condensed",
  features: { kickers: true, tightHeadlines: true, uppercaseNav: true, topRule: true },
};
