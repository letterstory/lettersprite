import type { Theme } from "./types";

/**
 * Kiosk — a warm, playful editorial-magazine look modelled on tastecooking.com:
 * a cream newsstand ground, bold high-contrast serif headlines, geometric-sans
 * kickers / nav / buttons, "Story: NAME" bylines, alternating image+text feature
 * rows, full-bleed promo colour bands with black rectangular buttons, and a
 * rainbow of per-section accent colours used as mats behind cover art and as
 * coloured kickers. Built for techfounderwriting.com — so it keeps that site's
 * brand red (matches its favicon) as the primary, on Taste's warm cream base.
 *
 * Fonts (free / Google, standing in for Taste's commercial faces):
 *  - Fraunces        → headlines / display  (≈ Tusar Deco, bold deco serif)
 *  - Newsreader      → body                 (≈ Domaine Text, refined serif)
 *  - Hanken Grotesk  → kickers / nav / UI   (≈ GT Eesti, warm geometric sans);
 *    lives in the `mono` slot (the theme's label font) — this is a prose site,
 *    not code-heavy, so no true monospace is needed.
 * Serif headlines require `allowSerif` (bypasses the global sans coercion).
 */
export const kiosk: Theme = {
  name: "kiosk",
  label: "Kiosk",
  description:
    "Warm editorial newsstand (Taste-style): cream ground, bold serif heads, geometric-sans kickers, vivid section colours.",
  colorScheme: "light",
  colors: {
    background: "#faf6ee", // warm off-white paper (matches the riso cover art)
    surface: "#fffdf6", // near-white warm card
    surfaceAlt: "#efe8d6", // muted cream band
    foreground: "#1e1610", // warm near-black (matches the favicon ink)
    muted: "#6f665a",
    border: "#d9ccb1",
    primary: "#c0392b", // techfounderwriting brand red (favicon)
    primaryForeground: "#fffdf6",
    secondary: "#2a7d6f", // teal, for accent variety
    accent: "#e0a12a", // warm gold (nod to Taste's signature)
    link: "#c0392b",
    heading: "#1e1610",
    kicker: "#c0392b",
    heroFrom: "#c0392b",
    heroTo: "#e0a12a",
  },
  fonts: {
    // Bold high-contrast serif for headlines (Tusar-Deco stand-in).
    display: {
      family: "'Fraunces', Georgia, 'Times New Roman', serif",
      google: { name: "Fraunces", weights: [500, 600, 700, 900], italic: true },
    },
    heading: {
      family: "'Fraunces', Georgia, 'Times New Roman', serif",
      google: { name: "Fraunces", weights: [500, 600, 700, 900] },
    },
    // Refined serif body (Domaine Text stand-in).
    body: {
      family: "'Newsreader', Georgia, serif",
      google: { name: "Newsreader", weights: [400, 500, 600], italic: true },
    },
    // Geometric sans for kickers / nav / buttons (GT Eesti stand-in). Sits in
    // the `mono` slot, which is the theme's label/UI font — rendered via
    // `font-mono` in the kiosk components.
    mono: {
      family: "'Hanken Grotesk', system-ui, -apple-system, sans-serif",
      google: { name: "Hanken Grotesk", weights: [500, 600, 700, 800] },
    },
  },
  radius: "0.125rem",
  contentWidth: "42rem",
  containerWidth: "80rem",
  home: "kiosk",
  article: "editorial",
  logo: "sans-bold",
  features: {
    kickers: true,
    rules: true,
    dropCap: true,
    allowSerif: true,
    kioskMasthead: true,
    kioskLists: true,
  },
};
