/**
 * Industry-to-theme mapping. When SITE_INDUSTRY is set, this provides a
 * default theme selection and palette that matches the vertical's visual
 * conventions. Manual THEME and SITE_*_COLOR overrides always take precedence.
 */

import type { Theme, ThemeColors } from "./types";

export type IndustryKey =
  | "healthcare"
  | "fintech"
  | "legal"
  | "tech"
  | "retail"
  | "realestate"
  | "education"
  | "food"
  | "travel"
  | "hr"
  | "marketing"
  | "sustainability";

/**
 * Maps common industry slugs to the best-fit theme name + a palette overlay.
 * The palette uses the same keys as ThemeColors so it slots directly into
 * applyOverrides logic — only the keys present here are overridden.
 */
export const INDUSTRY_PRESETS: Record<
  IndustryKey,
  { theme: string; colors: Partial<ThemeColors>; logo?: string }
> = {
  healthcare: {
    // Calm, trust-signaling. Serif long-form reads like a medical journal.
    theme: "review",
    colors: {
      primary: "#0077b6",
      secondary: "#48cae4",
      accent: "#00b4d8",
      heroFrom: "#023e8a",
      heroTo: "#0096c7",
      background: "#f8fafb",
      surface: "#eef4f8",
    },
  },
  fintech: {
    // Navy + amber — business desk, serious data-driven feel.
    theme: "ledger",
    colors: {
      primary: "#1e3a5f",
      secondary: "#f59e0b",
      accent: "#fbbf24",
      heroFrom: "#1e3a5f",
      heroTo: "#2d6a9f",
    },
  },
  legal: {
    // Deep authority: broadsheet serif, burgundy, restrained.
    theme: "chronicle",
    colors: {
      primary: "#7b1d1d",
      secondary: "#b45309",
      accent: "#d97706",
      heroFrom: "#4a1010",
      heroTo: "#7b1d1d",
      background: "#faf9f7",
      surface: "#f3f0eb",
    },
  },
  tech: {
    // Vivid tech-culture. High energy, purple→cyan gradient.
    theme: "signal",
    colors: {
      primary: "#7c3aed",
      secondary: "#06b6d4",
      accent: "#10b981",
      heroFrom: "#6d28d9",
      heroTo: "#0891b2",
    },
  },
  retail: {
    // Bold, commercial. Hot red condensed headlines.
    theme: "metro",
    colors: {
      primary: "#dc2626",
      secondary: "#ea580c",
      accent: "#f59e0b",
      heroFrom: "#b91c1c",
      heroTo: "#c2410c",
    },
  },
  realestate: {
    // Warm paper, lifestyle quarterly feel. Property content reads editorial.
    theme: "atelier",
    colors: {
      primary: "#78350f",
      secondary: "#92400e",
      accent: "#b45309",
      heroFrom: "#451a03",
      heroTo: "#78350f",
      background: "#fdf8f0",
      surface: "#faf0e4",
    },
  },
  education: {
    // Accessible, readable. Classic serif editorial.
    theme: "classic",
    colors: {
      primary: "#1d4ed8",
      secondary: "#2563eb",
      accent: "#7c3aed",
      heroFrom: "#1e3a8a",
      heroTo: "#1d4ed8",
      background: "#fafafa",
    },
  },
  food: {
    // Warm, rich. Lifestyle quarterly with appetizing amber tones.
    theme: "atelier",
    colors: {
      primary: "#b45309",
      secondary: "#d97706",
      accent: "#dc2626",
      heroFrom: "#7c2d12",
      heroTo: "#b45309",
      background: "#fffbf5",
      surface: "#fef3c7",
    },
  },
  travel: {
    // Cinematic full-bleed hero. Magazine glossy layout.
    theme: "magazine",
    colors: {
      primary: "#0f766e",
      secondary: "#0891b2",
      accent: "#f59e0b",
      heroFrom: "#134e4a",
      heroTo: "#0e7490",
    },
  },
  hr: {
    // Trustworthy, professional. Clean grid.
    theme: "sleek",
    colors: {
      primary: "#4338ca",
      secondary: "#6366f1",
      accent: "#8b5cf6",
      heroFrom: "#3730a3",
      heroTo: "#4f46e5",
      background: "#ffffff",
    },
  },
  marketing: {
    // Electric and energetic. High-contrast grotesque.
    theme: "current",
    colors: {
      primary: "#7c3aed",
      secondary: "#ec4899",
      accent: "#06b6d4",
      heroFrom: "#5b21b6",
      heroTo: "#be185d",
    },
  },
  sustainability: {
    // Natural greens, considered and calm.
    theme: "review",
    colors: {
      primary: "#166534",
      secondary: "#15803d",
      accent: "#4d7c0f",
      heroFrom: "#14532d",
      heroTo: "#166534",
      background: "#f7faf7",
      surface: "#ecf5ec",
    },
  },
};

/**
 * Normalize a free-text SITE_INDUSTRY value to a known IndustryKey, or null.
 * Handles common synonyms and alternate spellings.
 */
export function resolveIndustry(raw: string): IndustryKey | null {
  const s = raw.toLowerCase().replace(/[-_\s]+/g, "");
  const MAP: Record<string, IndustryKey> = {
    healthcare: "healthcare",
    health: "healthcare",
    medical: "healthcare",
    pharma: "healthcare",
    pharmaceutical: "healthcare",
    fintech: "fintech",
    finance: "fintech",
    financial: "fintech",
    banking: "fintech",
    insurance: "fintech",
    legal: "legal",
    law: "legal",
    tech: "tech",
    technology: "tech",
    software: "tech",
    saas: "tech",
    startup: "tech",
    retail: "retail",
    ecommerce: "retail",
    commerce: "retail",
    fashion: "retail",
    realestate: "realestate",
    property: "realestate",
    proptech: "realestate",
    education: "education",
    edtech: "education",
    learning: "education",
    food: "food",
    restaurant: "food",
    hospitality: "food",
    beverage: "food",
    travel: "travel",
    tourism: "travel",
    hospitaltiy: "travel",
    hr: "hr",
    humanresources: "hr",
    recruiting: "hr",
    talent: "hr",
    staffing: "hr",
    marketing: "marketing",
    advertising: "marketing",
    media: "marketing",
    sustainability: "sustainability",
    green: "sustainability",
    climate: "sustainability",
    cleantech: "sustainability",
    energy: "sustainability",
  };
  return MAP[s] ?? null;
}

/** Apply an industry preset onto a theme as a base layer. */
export function applyIndustryPreset(
  theme: Theme,
  industry: IndustryKey,
): Theme {
  const preset = INDUSTRY_PRESETS[industry];
  return {
    ...theme,
    colors: { ...theme.colors, ...preset.colors },
  };
}
