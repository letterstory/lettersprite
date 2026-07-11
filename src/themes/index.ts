import { env } from "@/env";
import type { FontSpec, Theme } from "./types";
import { sleek } from "./sleek";

export type { Theme, ThemeColors, FontSpec, LayoutVariant } from "./types";

export const DEFAULT_THEME = sleek.name;

/**
 * Every theme the `THEME` env var can select, keyed by name. Ships with one
 * base theme; add more by copying `sleek.ts`, importing it above, and
 * registering it here — then set `THEME=<name>` per deployment. After adding a
 * theme, run `npm run generate:covers` to produce its fallback cover images
 * (see `scripts/generate-covers.mts`).
 */
export const themes: Record<string, Theme> = {
  [sleek.name]: sleek,
};

export function listThemes(): Theme[] {
  return Object.values(themes);
}

/** Replace a font with a Google-Fonts family named by an env override. */
function overrideFont(googleName: string): FontSpec {
  return {
    family: `'${googleName}', system-ui, -apple-system, 'Segoe UI', sans-serif`,
    // Only 400/700 — near-universal weights, so any Google family resolves
    // without a 400 from the css2 API (which rejects unsupported weights).
    google: { name: googleName, weights: [400, 700] },
  };
}

/** Layer optional per-deployment env overrides on top of a base theme. */
function applyOverrides(theme: Theme): Theme {
  const hasColorOverride =
    env.accentColor ||
    env.backgroundColor ||
    env.textColor ||
    env.headingColor ||
    env.linkColor;
  if (!hasColorOverride && !env.fontBody && !env.fontHeading) return theme;

  const colors = { ...theme.colors };
  if (env.accentColor) colors.primary = env.accentColor;
  if (env.backgroundColor) colors.background = env.backgroundColor;
  if (env.textColor) colors.foreground = env.textColor;
  if (env.headingColor) colors.heading = env.headingColor;
  if (env.linkColor) colors.link = env.linkColor;

  return {
    ...theme,
    colors,
    fonts: {
      ...theme.fonts,
      body: env.fontBody ? overrideFont(env.fontBody) : theme.fonts.body,
      heading: env.fontHeading
        ? overrideFont(env.fontHeading)
        : theme.fonts.heading,
    },
  };
}

/** The theme this deployment renders, selected by the `THEME` env var. */
export function getActiveTheme(): Theme {
  const base = themes[env.theme];
  if (!base) {
    console.warn(
      `[themes] THEME="${env.theme}" is not a known theme; falling back to "${DEFAULT_THEME}". ` +
        `Available: ${Object.keys(themes).join(", ")}.`,
    );
  }
  return applyOverrides(base ?? themes[DEFAULT_THEME]);
}
