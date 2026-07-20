import type { Theme } from "./types";

/**
 * Kernel — a minimalist developer & open-source project blog. A near-monochrome
 * page with a single deep-green signal, a monospace flag and monospace display
 * headlines over a clean Inter body. Reads like a well-kept CLI tool's changelog.
 */
export const kernel: Theme = {
  name: "kernel",
  label: "Kernel",
  description: "Minimal developer/OSS blog: monochrome, monospace flag, terminal-green signal.",
  colorScheme: "light",
  colors: {
    background: "#ffffff",
    surface: "#f6f7f6",
    surfaceAlt: "#edefed",
    foreground: "#0e120e",
    muted: "#5f655f",
    border: "#e5e8e5",
    primary: "#166534",
    primaryForeground: "#ffffff",
    secondary: "#1f2937",
    accent: "#22c55e",
    link: "#166534",
    heading: "#0e120e",
    kicker: "#166534",
    heroFrom: "#14532d",
    heroTo: "#166534",
  },
  fonts: {
    display: {
      family: "'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace",
      google: { name: "JetBrains Mono", weights: [700, 800] },
    },
    heading: {
      family: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
      google: { name: "Inter", weights: [600, 700] },
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
  radius: "0.25rem",
  contentWidth: "44rem",
  containerWidth: "72rem",
  home: "grid",
  article: "standard",
  logo: "mono",
  features: { kickers: true },
};
