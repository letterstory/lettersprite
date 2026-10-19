import type { Theme } from "./types";

/**
 * Codex — a 1:1 structural clone of every.to: a solid-black masthead (burger +
 * search left, muted "Sign in" + pale sky-cyan rounded "Subscribe" right, a
 * centered serif wordmark), cream-paper reading surfaces, serif headlines AND
 * serif article body copy, and a solid-black footer. No ads, no invented
 * marketing banners — just the chrome and type system, carrying
 * preauthreview.com's own real content.
 *
 * Palette read from computed styles against the live site: cream/ivory paper
 * `#fdfaf7` (every.to's "postgray"), near-black ink `#111111` for body copy,
 * true black `#000000` for the masthead and footer, and every.to's one pale
 * sky-cyan accent `#c0f0fb` ("everyblue") used sparingly for the Subscribe
 * pill and small highlights — not a primary brand color.
 *
 * Fonts (free / Google, standing in for every.to's commercial faces):
 *  - Source Serif 4 → display / heading / body (≈ Signifier, their
 *    high-contrast transitional serif used for both headlines and the
 *    article reading column — unusual, but that's exactly their system)
 *  - Hanken Grotesk  → UI sans (≈ Switzer, their nav/meta/button face),
 *    loaded in the `mono` slot and applied explicitly via `font-mono` on the
 *    codex masthead's nav/Subscribe/Sign-in — this theme has no true
 *    monospace accent anywhere, matching every.to's own template (its one
 *    mono face is used by an unrelated conference microsite, not the blog).
 *
 * Deliberate deviation from the source: every.to swaps its masthead to a
 * light cream bar with thin flanking rules on article pages and a solid-black
 * bar on the homepage. This codebase's masthead is one consistent chrome per
 * theme (not per-route), so codex keeps the black masthead everywhere — the
 * single most recognizable piece of every.to's chrome — rather than add a
 * route-aware variant no other theme in this fleet does.
 */
export const codex: Theme = {
  name: "codex",
  label: "Codex",
  description:
    "every.to-style literary tech-essay blog: solid-black masthead with a pale sky-cyan Subscribe pill, cream paper, serif headlines and serif body copy throughout.",
  colorScheme: "light",
  colors: {
    background: "#fdfaf7",
    surface: "#f3efe9",
    surfaceAlt: "#e5e0d8",
    foreground: "#111111",
    muted: "#6b6b6b",
    border: "#d5d5d5",
    primary: "#111111",
    primaryForeground: "#ffffff",
    secondary: "#000000",
    accent: "#c0f0fb",
    link: "#111111",
    heading: "#111111",
    kicker: "#6b6b6b",
    heroFrom: "#111111",
    heroTo: "#000000",
  },
  fonts: {
    display: {
      family: "'Source Serif 4', 'Hoefler Text', Georgia, serif",
      google: { name: "Source Serif 4", weights: [400, 600, 700], italic: true },
    },
    heading: {
      family: "'Source Serif 4', 'Hoefler Text', Georgia, serif",
      google: { name: "Source Serif 4", weights: [400, 600, 700], italic: true },
    },
    body: {
      family: "'Source Serif 4', Georgia, serif",
      google: { name: "Source Serif 4", weights: [400, 500], italic: true },
    },
    mono: {
      family: "'Hanken Grotesk', system-ui, -apple-system, 'Segoe UI', sans-serif",
      google: { name: "Hanken Grotesk", weights: [400, 500, 600] },
    },
  },
  radius: "0.375rem",
  contentWidth: "42rem",
  containerWidth: "80rem",
  home: "codex",
  article: "feature",
  logo: "serif",
  features: {
    codexMasthead: true,
    allowSerif: true,
  },
};
