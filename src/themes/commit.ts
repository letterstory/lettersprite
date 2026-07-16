import type { Theme } from "./types";

/**
 * Commit — an engineering blog & product changelog (Linear / Vercel / Stripe
 * release notes). Clean light UI, an iris-to-blue brand with a git-green pop, a
 * mono wordmark, and a dated timeline front that reads as a running log of ships.
 */
export const commit: Theme = {
  name: "commit",
  label: "Commit",
  description: "Engineering changelog: iris + git-green, mono wordmark, dated timeline front.",
  colorScheme: "light",
  colors: {
    background: "#ffffff",
    surface: "#f7f8fa",
    surfaceAlt: "#eef1f5",
    foreground: "#0d1117",
    muted: "#57606a",
    border: "#e3e8ef",
    primary: "#5b5bd6", // iris
    primaryForeground: "#ffffff",
    secondary: "#0969da", // blue
    accent: "#1f883d", // git green
    link: "#0757c2", // darkened blue for AA
    heading: "#0d1117",
    kicker: "#5b5bd6",
    heroFrom: "#5b5bd6",
    heroTo: "#0969da",
  },
  fonts: {
    display: {
      family: "'Space Grotesk', system-ui, sans-serif",
      google: { name: "Space Grotesk", weights: [500, 600, 700] },
    },
    heading: {
      family: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
      google: { name: "Inter", weights: [600, 700, 800] },
    },
    body: {
      family: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
      google: { name: "Inter", weights: [400, 500, 600, 700] },
    },
    mono: {
      family: "'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace",
      google: { name: "JetBrains Mono", weights: [400, 700] },
    },
  },
  radius: "0.5rem",
  contentWidth: "44rem",
  containerWidth: "74rem",
  home: "timeline",
  article: "standard",
  logo: "mono",
  features: { kickers: true, rules: true },
};
