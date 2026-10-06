import type { Theme } from "./types";

/**
 * Circuit — a WIRED-style technology-news portal on bright white. A black
 * utility strip over a masthead with a boxed geometric wordmark (top-left), an
 * inline uppercase section nav and a blue "Subscribe"; a labeled leaderboard;
 * a three-column hero (Today's Picks list │ centered lead │ Trending list); then
 * full-width section rivers headed by black tab labels, with in-feed + rail ads.
 *
 * WIRED signatures: bold SERIF editorial headlines, sans (Apercu-style) rubrics
 * in black, a teal-blue interactive accent, thin grey rules, sharp corners.
 *
 * Fonts: Source Serif 4 (editorial headlines, standing in for Wired Display) +
 * Archivo (heavy geometric wordmark) + Inter (UI/body/deks, for Apercu). Built
 * for managedenials.com.
 */
export const circuit: Theme = {
  name: "circuit",
  label: "Circuit",
  description:
    "WIRED-style tech-news portal: black utility strip + boxed wordmark masthead, three-column hero, black tab section labels, serif headlines, teal-blue accent, leaderboard + in-feed + rail ads.",
  colorScheme: "light",
  colors: {
    background: "#ffffff",
    surface: "#f4f4f4",
    surfaceAlt: "#e9e9e9",
    foreground: "#1a1a1a",
    muted: "#707070",
    border: "#d9d9d9",
    primary: "#057dbc", // WIRED interactive teal-blue — links, Subscribe
    primaryForeground: "#ffffff",
    secondary: "#0a0a0a", // black — wordmark, tabs, masthead ink
    accent: "#d40000", // WIRED red — reserved pop (logo box tick)
    link: "#057dbc",
    heading: "#0a0a0a",
    kicker: "#1a1a1a", // rubrics are BLACK, not colored
    heroFrom: "#057dbc",
    heroTo: "#0a0a0a",
  },
  fonts: {
    // Editorial headlines — a high-contrast Didone display serif: sharp, flat
    // serifs and straight stems (closest free stand-in for Wired Display).
    display: {
      family: "'Playfair Display', Georgia, 'Times New Roman', serif",
      google: { name: "Playfair Display", weights: [600, 700, 800, 900] },
    },
    // Wordmark — a squared, sharp-cornered techno face (not the rounded mono).
    heading: {
      family: "'Chakra Petch', 'Archivo', -apple-system, 'Helvetica Neue', Arial, sans-serif",
      google: { name: "Chakra Petch", weights: [600, 700] },
    },
    // UI, rubrics, bylines, deks — clean sans.
    body: {
      family: "'Inter', -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif",
      google: { name: "Inter", weights: [400, 500, 600, 700] },
    },
    // Kicker/rubric mono — squared monospace (Wired Mono stand-in).
    mono: {
      family: "'Space Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
      google: { name: "Space Mono", weights: [400, 700] },
    },
  },
  radius: "0",
  contentWidth: "42rem",
  // Wide, like WIRED — but the extra width is spent on a right ad rail, so the
  // editorial measure (Today's Picks + the lead) keeps its tight ~2-column
  // proportions instead of spreading thin.
  containerWidth: "112rem", // fills the screen edge-to-edge like the hero ad
  home: "circuit",
  article: "feature",
  logo: "sans-bold",
  features: {
    allowSerif: true, // the WIRED headline is a high-contrast display serif
    kickers: true,
    rules: true,
    dropCap: true,
    tightHeadlines: true,
    circuitMasthead: true,
  },
};
