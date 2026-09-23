import type { Theme } from "./types";

/**
 * Quarto — a restrained, type-nerd editorial journal in the mould of a serif
 * review publication: a warm paper ground, refined high-contrast serif
 * headlines, small-caps section labels, and three distinct bands — a featured
 * review + a square-thumbnail card grid, a cover strip, and a dated archive
 * list with a sidebar. Generous whitespace, hairline rules, colour only from
 * the palette. Built for relationshipmanagementreviews.com, so it keeps that
 * site's warm cream / gold / navy.
 *
 * Fonts: Fraunces (display/heading, an old-style high-contrast serif) + Newsreader
 * (body, an editorial reading serif). Serif is intentional — `allowSerif`.
 */
export const quarto: Theme = {
  name: "quarto",
  label: "Quarto",
  description:
    "Restrained serif review journal: warm paper ground, high-contrast serif headlines, small-caps labels, featured + card grid.",
  colorScheme: "light",
  colors: {
    background: "#f7f4ef", // warm paper
    surface: "#efece4",
    surfaceAlt: "#eeeae1",
    foreground: "#1e1c18",
    muted: "#6b6357", // warm gray-brown
    border: "#e0dace", // warm hairline
    primary: "#8b6914", // gold / ochre
    primaryForeground: "#ffffff",
    secondary: "#2c4a6e", // navy
    accent: "#c4873a", // amber
    link: "#8b6914",
    heading: "#1e1c18",
    kicker: "#8b6914",
    heroFrom: "#8b6914",
    heroTo: "#c4873a",
  },
  fonts: {
    display: {
      family: "'Fraunces', 'Hoefler Text', Georgia, 'Times New Roman', serif",
      google: { name: "Fraunces", weights: [400, 500, 600, 700, 900], italic: true },
    },
    heading: {
      family: "'Fraunces', 'Hoefler Text', Georgia, 'Times New Roman', serif",
      google: { name: "Fraunces", weights: [500, 600, 700] },
    },
    body: {
      family: "'Newsreader', Georgia, 'Times New Roman', serif",
      google: { name: "Newsreader", weights: [400, 500, 600, 700], italic: true },
    },
    mono: {
      family: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
    },
  },
  radius: "0",
  contentWidth: "40rem",
  containerWidth: "84rem",
  home: "quarto",
  article: "editorial",
  logo: "serif",
  features: {
    allowSerif: true,
    kickers: true,
    rules: true,
    quartoMasthead: true,
    quartoLists: true,
  },
};
