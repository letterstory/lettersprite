import type { Theme } from "./types";

/**
 * Riot — a bold, high-contrast youth-culture magazine front (FURFUR-style): a
 * black gridded masthead with cell dividers and a centered condensed wordmark,
 * an asymmetric image-forward grid (a big hero tile with the headline burned
 * into the image, a mixed right rail, a two-column icon-thumbnail news list,
 * portrait cards) and house-ad rectangles — a long, dense scroll. Built for
 * youragentrunning.com, so it keeps that site's warm-paper ground with its
 * orange (#f5622d) + near-black brand, standing in for FURFUR's red.
 *
 * Fonts: Oswald (condensed grotesque — wordmark, overlaid hero headlines, labels)
 * over PT Serif (card headlines + reading body).
 */
export const riot: Theme = {
  name: "riot",
  label: "Riot",
  description:
    "Bold high-contrast youth-culture magazine: black gridded masthead with a centered condensed wordmark, asymmetric image-forward grid with burned-in headlines, icon-thumbnail news list, house ads — a long dense front.",
  colorScheme: "light",
  colors: {
    background: "#f8f7f4", // warm paper
    surface: "#ffffff",
    surfaceAlt: "#ebe9e3", // ad wells, bands
    foreground: "#1c1b18",
    muted: "#6b6862",
    border: "#ddd9d0",
    primary: "#f5622d", // brand orange (FURFUR's red)
    primaryForeground: "#ffffff",
    secondary: "#0f0e0c", // near-black: masthead, icon strokes
    accent: "#f5622d",
    link: "#d8481a", // slightly deeper orange for legibility on white
    heading: "#0f0e0c",
    kicker: "#f5622d",
    heroFrom: "#f5622d",
    heroTo: "#0f0e0c",
  },
  // Night palette for the reader's day/night toggle — the same orange brand
  // re-grounded on warm charcoal. The masthead bar stays pure black so it still
  // reads against the dark page. Layout, fonts and spacing are shared.
  colorsLight: {
    background: "#14130f", // warm charcoal (night paper)
    surface: "#1c1b17",
    surfaceAlt: "#26241e",
    foreground: "#f2efe8",
    muted: "#9a958a",
    border: "#34322b",
    primary: "#f5622d",
    primaryForeground: "#ffffff",
    secondary: "#000000", // masthead bar — black on the charcoal ground
    accent: "#f5622d",
    link: "#ff7a45",
    heading: "#ffffff",
    kicker: "#f5622d",
    heroFrom: "#f5622d",
    heroTo: "#000000",
  },
  fonts: {
    display: {
      family: "'Oswald', 'Arial Narrow', -apple-system, sans-serif",
      google: { name: "Oswald", weights: [400, 500, 600, 700] },
    },
    heading: {
      family: "'PT Serif', Georgia, 'Times New Roman', serif",
      google: { name: "PT Serif", weights: [400, 700], italic: true },
    },
    body: {
      family: "'PT Serif', Georgia, 'Times New Roman', serif",
      google: { name: "PT Serif", weights: [400, 700], italic: true },
    },
    mono: {
      family: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
    },
  },
  radius: "0", // sharp, brutalist — no rounded corners
  contentWidth: "42rem",
  containerWidth: "80rem",
  home: "riot",
  article: "feature",
  logo: "condensed",
  features: {
    allowSerif: true,
    kickers: true,
    rules: true,
    tightHeadlines: true,
    modeToggle: true, // day/night switch (pairs with colorsLight night palette)
    riotMasthead: true,
    riotLists: true,
    riotArticle: true,
  },
};
