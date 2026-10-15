import type { Theme } from "./types";

/**
 * Canvas — a clean modern SaaS product blog modelled on glideapps.com/blog
 * ("The Column"): a centered hero title + standfirst + inline subscribe field,
 * a pill-nav masthead, and a card grid with 16:9 rounded covers, circular
 * author avatars and generous whitespace. No ads, no rails — a calm product
 * blog, not a news portal.
 *
 * Built for claimscurrent.com, so the palette is matched to its live site
 * (not Glide's own brand colors): warm paper ground, deep green primary,
 * navy secondary, amber accent, crimson kicker.
 *
 * Fonts (free / Google, standing in for Glide's commercial faces):
 *  - Plus Jakarta Sans → display / heading / body (≈ Booton VF, Glide's one
 *    workhorse variable sans used everywhere from the hero down to card meta)
 *  - IBM Plex Mono     → mono (claimscurrent already loads this face itself,
 *    so kickers/meta stay visually consistent with the source site)
 */
export const canvas: Theme = {
  name: "canvas",
  label: "Canvas",
  description:
    "Glide-style modern SaaS product blog: centered hero + subscribe field, pill-nav masthead, rounded 16:9 card grid with circular author avatars. No ads.",
  colorScheme: "light",
  colors: {
    background: "#f7f4ef",
    surface: "#eeeae2",
    surfaceAlt: "#f5efe6",
    foreground: "#1c1c1a",
    muted: "#5c5852",
    border: "#ded8ce",
    primary: "#1a6b4a",
    primaryForeground: "#ffffff",
    secondary: "#2d4a6e",
    accent: "#d4820a",
    link: "#1a6b4a",
    heading: "#0f2d1f",
    kicker: "#e3120b",
    heroFrom: "#0f2d1f",
    heroTo: "#1a6b4a",
  },
  fonts: {
    display: {
      family: "'Plus Jakarta Sans', system-ui, -apple-system, 'Segoe UI', sans-serif",
      google: { name: "Plus Jakarta Sans", weights: [600, 700, 800] },
    },
    heading: {
      family: "'Plus Jakarta Sans', system-ui, -apple-system, 'Segoe UI', sans-serif",
      google: { name: "Plus Jakarta Sans", weights: [600, 700, 800] },
    },
    body: {
      family: "'Plus Jakarta Sans', system-ui, -apple-system, 'Segoe UI', sans-serif",
      google: { name: "Plus Jakarta Sans", weights: [400, 500, 600] },
    },
    mono: {
      family: "'IBM Plex Mono', ui-monospace, Menlo, monospace",
      google: { name: "IBM Plex Mono", weights: [400, 600] },
    },
  },
  radius: "0.5rem",
  contentWidth: "42rem",
  containerWidth: "80rem",
  home: "canvas",
  article: "standard",
  logo: "sans-bold",
  features: {
    canvasMasthead: true,
  },
};
