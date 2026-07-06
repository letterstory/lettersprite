import type { Theme } from "./types";

/** Dark, single column. Calm ink-blue palette with a soft blue accent. */
export const midnight: Theme = {
  name: "midnight",
  label: "Midnight",
  description: "Dark, single-column reading with a soft blue accent.",
  colorScheme: "dark",
  colors: {
    background: "#0b0d12",
    surface: "#161a23",
    foreground: "#e6e9ef",
    muted: "#9aa3b2",
    border: "#232a37",
    primary: "#7aa2f7",
    primaryForeground: "#0b0d12",
    link: "#8ab4f8",
    heading: "#f5f7fb",
  },
  fonts: {
    body: {
      family: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
      google: { name: "Inter", weights: [400, 500, 600, 700] },
    },
    heading: {
      family: "'Space Grotesk', system-ui, sans-serif",
      google: { name: "Space Grotesk", weights: [500, 600, 700] },
    },
    mono: {
      family: "'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace",
      google: { name: "JetBrains Mono", weights: [400, 700] },
    },
  },
  radius: "0.5rem",
  contentWidth: "44rem",
  containerWidth: "46rem",
  layout: "list",
};
