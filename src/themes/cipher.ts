import type { Theme } from "./types";

/**
 * Cipher — a cybersecurity & infosec desk. A restrained steel-dark console (not
 * neon) with a red alert brand and an amber second signal, technical Saira
 * headlines over an IBM Plex Sans body, laid out as an advisories feed.
 */
export const cipher: Theme = {
  name: "cipher",
  label: "Cipher",
  description: "Cybersecurity desk: steel-dark console, red alert brand, amber signal, feed.",
  colorScheme: "dark",
  colors: {
    background: "#0b0d10",
    surface: "#14171c",
    surfaceAlt: "#1a1e24",
    foreground: "#dfe3e8",
    muted: "#929aa6",
    border: "#262b33",
    primary: "#ef4444",
    primaryForeground: "#0b0d10",
    secondary: "#f87171",
    accent: "#f59e0b",
    link: "#fca5a5",
    heading: "#f4f6f8",
    kicker: "#f87171",
    heroFrom: "#dc2626",
    heroTo: "#7f1d1d",
  },
  fonts: {
    display: {
      family: "'Saira', system-ui, 'Helvetica Neue', sans-serif",
      google: { name: "Saira", weights: [700, 800, 900] },
    },
    heading: {
      family: "'Saira', system-ui, 'Helvetica Neue', sans-serif",
      google: { name: "Saira", weights: [600, 700, 800] },
    },
    body: {
      family: "'IBM Plex Sans', system-ui, -apple-system, sans-serif",
      google: { name: "IBM Plex Sans", weights: [400, 500, 600, 700] },
    },
    mono: {
      family: "'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace",
      google: { name: "JetBrains Mono", weights: [400, 700] },
    },
  },
  radius: "0.25rem",
  contentWidth: "44rem",
  containerWidth: "74rem",
  home: "feed",
  article: "standard",
  logo: "boxed",
  features: { kickers: true, rules: true, uppercaseNav: true, topRule: true },
};
