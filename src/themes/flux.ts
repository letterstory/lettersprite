import type { Theme } from "./types";

/**
 * Flux — a bold, ad-supported tech-editorial front in the mould of a big
 * technology news portal: a top leaderboard, a slash-separated nav under a
 * heavy wordmark, a two-column body (a hero + rule-topped section blocks in the
 * main column, a "Latest" stream + rectangle ads in the right rail), colored
 * section rules, heavy grotesque headlines over serif deks. Built for
 * theproductionrun.com, so it keeps that site's cream / crimson / gold / ink.
 *
 * Fonts: Archivo (heavy grotesque headlines/UI) + Newsreader (serif body/deks).
 * The serif body is intentional — `allowSerif`.
 */
export const flux: Theme = {
  name: "flux",
  label: "Flux",
  description:
    "Bold ad-supported tech-editorial front: leaderboard + slash nav, hero + section blocks, right-rail stream, grotesque headlines over serif deks.",
  colorScheme: "light",
  colors: {
    background: "#f5f2eb", // warm cream
    surface: "#ffffff",
    surfaceAlt: "#edeae0",
    foreground: "#1a1a18", // ink
    muted: "#565d68",
    border: "#dcd8cd",
    primary: "#c0392b", // crimson (the accent rule / links / kickers)
    primaryForeground: "#ffffff",
    secondary: "#1a1a18", // ink
    accent: "#f0c040", // gold pop
    link: "#c0392b",
    heading: "#1a1a18",
    kicker: "#c0392b",
    heroFrom: "#c0392b",
    heroTo: "#f0c040",
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
  home: "flux",
  article: "feature",
  logo: "sans-bold",
  features: {
    allowSerif: true, // serif deks/body
    kickers: true,
    rules: true,
    fluxMasthead: true,
    fluxLists: true,
    fluxArticle: true,
  },
};
