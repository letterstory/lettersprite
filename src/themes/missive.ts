import type { Theme } from "./types";

/**
 * Missive — a writer's personal newsletter (Substack / a weekly dispatch). Warm
 * near-white paper, a burnt-orange stamp accent, an all-Fraunces voice, and a
 * quiet numbered digest front. Intimate and text-forward, like an email issue.
 */
export const missive: Theme = {
  name: "missive",
  label: "Missive",
  description: "Personal newsletter digest: warm paper, Fraunces serif, numbered reading list.",
  colorScheme: "light",
  colors: {
    background: "#fefdfb",
    surface: "#f4f1ea",
    surfaceAlt: "#ece7de",
    foreground: "#1b1a17",
    muted: "#6a655c",
    border: "#e4dfd4",
    primary: "#b0400c", // burnt orange
    primaryForeground: "#ffffff",
    secondary: "#57534e",
    accent: "#a16207", // mustard
    link: "#b0400c",
    heading: "#1b1a17",
    kicker: "#b0400c",
    heroFrom: "#1b1a17",
    heroTo: "#3a352e",
  },
  fonts: {
    display: {
      family: "'Fraunces', Georgia, serif",
      google: { name: "Fraunces", weights: [500, 700, 800], italic: true },
    },
    heading: {
      family: "'Fraunces', Georgia, serif",
      google: { name: "Fraunces", weights: [500, 600] },
    },
    body: {
      family: "'Source Serif 4', Georgia, serif",
      google: { name: "Source Serif 4", weights: [400, 600, 700], italic: true },
    },
    mono: {
      family: "'IBM Plex Mono', ui-monospace, Menlo, monospace",
      google: { name: "IBM Plex Mono", weights: [400, 600] },
    },
  },
  radius: "0.375rem",
  contentWidth: "40rem",
  containerWidth: "52rem",
  home: "digest",
  article: "editorial",
  logo: "underline",
  features: { kickers: true, dropCap: true, centeredMasthead: true },
};
