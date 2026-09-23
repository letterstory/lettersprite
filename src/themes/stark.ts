import type { Theme } from "./types";

/**
 * Stark — an ultra-minimal monospace image archive in the mould of a
 * photo-essay index: a hairline mono masthead (wordmark + search over a slim
 * centered section nav), then a single wide column of large images, each with a
 * small centered monospace caption above it and a muted dateline below.
 * Generous whitespace, near-white ground, colour only from the covers + one
 * accent. Built for compmrkt.com, so it keeps that site's warm-white / crimson
 * / amber / mint.
 *
 * Fonts: IBM Plex Mono (display/heading/captions) + IBM Plex Sans (body). The
 * monospace display is deliberate — `allowSerif` keeps it from being coerced.
 */
export const stark: Theme = {
  name: "stark",
  label: "Stark",
  description:
    "Minimal monospace image archive: near-white ground, mono captions, one big image column, generous whitespace.",
  colorScheme: "light",
  colors: {
    background: "#f7f6f2", // warm near-white
    surface: "#ffffff",
    surfaceAlt: "#eef0f7",
    foreground: "#1a1a2e", // ink navy-black
    muted: "#585f70",
    border: "#e5e8f0",
    primary: "#d4365c", // crimson
    primaryForeground: "#ffffff",
    secondary: "#f5a623", // amber
    accent: "#2ddbb4", // mint
    link: "#d4365c",
    heading: "#1a1a2e",
    kicker: "#d4365c",
    heroFrom: "#d4365c",
    heroTo: "#f5a623",
  },
  fonts: {
    display: {
      family: "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
      google: { name: "IBM Plex Mono", weights: [400, 500, 600] },
    },
    heading: {
      family: "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
      google: { name: "IBM Plex Mono", weights: [500, 600] },
    },
    body: {
      family: "'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      google: { name: "IBM Plex Sans", weights: [400, 500, 600] },
    },
    mono: {
      family: "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
      google: { name: "IBM Plex Mono", weights: [400, 500] },
    },
  },
  radius: "0",
  contentWidth: "44rem",
  containerWidth: "72rem",
  home: "stark",
  article: "standard",
  logo: "mono",
  features: {
    allowSerif: true, // preserve the monospace display/heading (not serif per se)
    kickers: true,
    starkMasthead: true,
    // Section/author pages use the "latest in" lead + right-rail + river index.
    slateLists: true,
  },
};
