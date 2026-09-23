import type { Theme } from "./types";

/**
 * Blitz — a bold culture-news grid in the mould of streetwear/culture magazines:
 * a near-black ground, bold Bricolage Grotesque headlines, a centered wordmark
 * over an uppercase category nav, a three-column hero (text lead | big image |
 * image+text), and a Latest/Popular story river with a sticky ad rail. Colour
 * comes from the covers and one accent. Built for videocontentforstartups.com,
 * so it keeps that site's dark ground + indigo / teal / amber.
 *
 * Fonts: Helvetica Neue everywhere (system; Arial fallback), matching the
 * reference publication's type exactly.
 */
export const blitz: Theme = {
  name: "blitz",
  label: "Blitz",
  description:
    "Bold culture-news grid: dark ground, Helvetica Neue headlines, centered wordmark, Latest/Popular story river.",
  colorScheme: "dark",
  colors: {
    background: "#0f0f14", // videocontentforstartups near-black ground
    surface: "#16161d",
    surfaceAlt: "#1e1e28",
    foreground: "#e6e6ef",
    muted: "#8b8b99",
    border: "#2a2a36",
    primary: "#7b72ff", // indigo, lifted for the dark ground
    primaryForeground: "#ffffff",
    secondary: "#00c2a8", // teal
    accent: "#f5a623", // amber (metric icon / highlights)
    link: "#8b83ff",
    heading: "#ffffff",
    kicker: "#8b83ff",
    heroFrom: "#5b4fe8",
    heroTo: "#00c2a8",
  },
  // Light palette for the reader-toggled dark/light switch — same indigo / teal
  // / amber brand, on a clean white ground with near-black type.
  colorsLight: {
    background: "#ffffff",
    surface: "#ffffff",
    surfaceAlt: "#f3f3f5",
    foreground: "#131317",
    muted: "#6b6b76",
    border: "#e4e4e9",
    primary: "#5b4fe8", // indigo reads well on white as-is
    primaryForeground: "#ffffff",
    secondary: "#00a892",
    accent: "#d98a00", // deeper amber so the metric mark stays legible on white
    link: "#5b4fe8",
    heading: "#0b0b0e",
    kicker: "#5b4fe8",
    heroFrom: "#5b4fe8",
    heroTo: "#00c2a8",
  },
  // Helvetica Neue everywhere, matching the reference publication exactly: real
  // Helvetica Neue on Apple devices, Arial on Windows (the same fallback the
  // reference itself uses). No web font is loaded — these are system faces.
  fonts: {
    display: {
      family: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    },
    heading: {
      family: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    },
    body: {
      family: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    },
    mono: {
      family: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
    },
  },
  radius: "0",
  contentWidth: "42rem",
  containerWidth: "90rem",
  home: "blitz",
  article: "standard",
  logo: "sans-bold",
  features: {
    kickers: true,
    rules: true,
    blitzMasthead: true,
    blitzLists: true,
    blitzArticle: true,
    modeToggle: true,
    stockCovers: true,
  },
};
