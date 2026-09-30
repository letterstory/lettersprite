import type { Theme } from "./types";

/**
 * Relay — a bold, ad-supported tech-news portal (Verge-style) on a dark
 * developer ground: a slash-nav masthead with a working menu + keyboard search,
 * a long front (hero + section blocks + More/Latest grids + Instagram & Twitter
 * embeds), colored section-name category banners, a matching article page, and
 * static house-ad slots. Built for agenttoproduct.com, so it keeps that site's
 * GitHub-dark ground + teal / purple / gold.
 *
 * Fonts: Archivo (heavy grotesque headlines/UI) + Newsreader (serif body/deks).
 */
export const relay: Theme = {
  name: "relay",
  label: "Relay",
  description:
    "Dark ad-supported tech-news portal: slash-nav masthead, long hero + section-block front with Instagram/Twitter embeds, colored category banners, static ad slots.",
  colorScheme: "dark",
  colors: {
    background: "#0d1117", // GitHub-dark navy
    surface: "#161b22",
    surfaceAlt: "#1c2330",
    foreground: "#e2e8f0",
    muted: "#8b95a5",
    border: "#2a3140",
    primary: "#00c896", // teal
    primaryForeground: "#052018", // dark ink on teal
    secondary: "#7c3aed", // purple
    accent: "#f0c040", // gold
    link: "#34d9a8",
    heading: "#f5f8fc",
    kicker: "#00c896",
    heroFrom: "#00c896",
    heroTo: "#7c3aed",
  },
  // Daylight palette for the reader's sun/moon toggle — the same teal / purple /
  // gold system re-grounded on white, with the accents deepened for legibility
  // on a light field. Fonts, spacing and layout are shared; only colors swap.
  colorsLight: {
    background: "#ffffff",
    surface: "#f4f7fa",
    surfaceAlt: "#e9eef4",
    foreground: "#1a2230",
    muted: "#5c6775",
    border: "#d7dee6",
    primary: "#009e77", // deeper teal — legible on white
    primaryForeground: "#ffffff",
    secondary: "#6d28d9", // deeper purple
    accent: "#b8790a", // deeper gold
    link: "#008768",
    heading: "#0d1420",
    kicker: "#009e77",
    heroFrom: "#00c896",
    heroTo: "#7c3aed",
  },
  fonts: {
    display: {
      family: "'Archivo', -apple-system, 'Helvetica Neue', Arial, sans-serif",
      google: { name: "Archivo", weights: [600, 700, 800, 900] },
    },
    heading: {
      family: "'Archivo', -apple-system, 'Helvetica Neue', Arial, sans-serif",
      google: { name: "Archivo", weights: [600, 700, 800] },
    },
    body: {
      family: "'Newsreader', Georgia, 'Times New Roman', serif",
      google: { name: "Newsreader", weights: [400, 500, 600] },
    },
    mono: {
      family: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
    },
  },
  radius: "0",
  contentWidth: "44rem",
  containerWidth: "80rem",
  home: "relay",
  article: "feature",
  logo: "sans-bold",
  features: {
    allowSerif: true,
    kickers: true,
    rules: true,
    modeToggle: true, // sun/moon day-night switch (pairs with colorsLight)
    fluxMasthead: true,
    fluxLists: true,
    fluxArticle: true,
  },
};
