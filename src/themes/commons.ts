import type { Theme } from "./types";

/**
 * Commons — a syg.ma-style independent-publishing look: a stark white ground,
 * near-black system-font type (syg.ma loads no web fonts — neither do we, so it
 * matches exactly and is instant), a big hero statement, a filter bar, and a
 * dense masonry feed of cards that mixes cover images with text-only entries,
 * each tagged with a small grey category, a bold headline, an author and a
 * reading-time metric. Minimal, editorial, archive-like. Built for salesly.org,
 * so the one accent is that site's blue.
 */
export const commons: Theme = {
  name: "commons",
  label: "Commons",
  description:
    "syg.ma-style minimal publishing archive: white ground, system type, dense mixed image/text masonry feed.",
  colorScheme: "light",
  colors: {
    background: "#ffffff",
    surface: "#ffffff",
    surfaceAlt: "#f2f2f2",
    foreground: "#111111",
    muted: "#767676",
    border: "#e4e4e4",
    primary: "#2563eb", // Salesly brand blue (the single accent)
    primaryForeground: "#ffffff",
    secondary: "#111111",
    accent: "#2563eb",
    link: "#2563eb",
    heading: "#111111",
    kicker: "#767676",
    heroFrom: "#111111",
    heroTo: "#2563eb",
  },
  // System fonts only — no Google request, exactly like syg.ma.
  fonts: {
    display: {
      family:
        "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Roboto, Arial, sans-serif",
    },
    heading: {
      family:
        "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Roboto, Arial, sans-serif",
    },
    body: {
      family:
        "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Roboto, Arial, sans-serif",
    },
    // syg.ma uses the system sans for everything — no monospace anywhere — so
    // the "mono" slot (metrics, counts) points at the same stack.
    mono: {
      family:
        "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Roboto, Arial, sans-serif",
    },
  },
  radius: "0",
  contentWidth: "42rem",
  containerWidth: "86rem",
  home: "commons",
  article: "standard",
  logo: "sans-bold",
  features: {
    kickers: true,
    rules: true,
    commonsMasthead: true,
    commonsLists: true,
  },
};
