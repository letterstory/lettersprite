import type { Theme } from "./types";

/**
 * Canvas — a clean modern SaaS product blog modelled on glideapps.com/blog
 * ("The Column"): a centered hero title + standfirst + inline subscribe field,
 * a pill-nav masthead, and a card grid with 16:9 rounded covers, circular
 * author avatars and generous whitespace. No ads, no rails — a calm product
 * blog, not a news portal.
 *
 * Palette is Glide's own exact neutral system, read from computed styles in
 * design-ref/glide-tokens.json (not claimscurrent's colors): near-black ink
 * for headlines/solid buttons, grays for muted text/hairlines/placeholders,
 * pure white ground. Glide uses no brand color anywhere on this page, so
 * none is introduced here either — kickers, pills and active states all stay
 * neutral, exactly like the reference.
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
    background: "#ffffff",
    surface: "#f5f5f2",
    surfaceAlt: "#d9dad3",
    foreground: "#000000",
    muted: "#525252",
    border: "#dcdcdc",
    primary: "#171715",
    primaryForeground: "#ffffff",
    secondary: "#171715",
    accent: "#525252",
    link: "#171715",
    heading: "#0e0e0d",
    kicker: "#525252",
    heroFrom: "#171715",
    heroTo: "#000000",
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
