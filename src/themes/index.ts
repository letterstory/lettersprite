import { env } from "@/env";
import type { FontSpec, LogoStyle, Theme } from "./types";
import { applyIndustryPreset, resolveIndustry, INDUSTRY_PRESETS } from "./industry";
import { generatedPalette } from "./generated-palette";
import { classic } from "./classic";
import { magazine } from "./magazine";
import { midnight } from "./midnight";
import { minimal } from "./minimal";
import { sleek } from "./sleek";
import { gazette } from "./gazette";
import { dispatch } from "./dispatch";
import { metro } from "./metro";
import { review } from "./review";
import { signal } from "./signal";
import { current } from "./current";
import { ledger } from "./ledger";
import { atelier } from "./atelier";
import { noir } from "./noir";
import { chronicle } from "./chronicle";

export type {
  Theme,
  ThemeColors,
  FontSpec,
  HomeLayout,
  ArticleLayout,
  LogoStyle,
} from "./types";

export const DEFAULT_THEME = sleek.name;

/**
 * Every theme the `THEME` env var can select, keyed by name. Add more by
 * copying `sleek.ts` (the documented template), importing it above, and
 * registering it here — then set `THEME=<name>` per deployment. After adding a
 * theme, run `npm run generate:covers` to produce its fallback cover images
 * (see `scripts/generate-covers.mts`).
 */
export const themes: Record<string, Theme> = {
  // Clean, versatile baselines.
  [sleek.name]: sleek,
  [classic.name]: classic,
  [minimal.name]: minimal,
  [magazine.name]: magazine,
  [midnight.name]: midnight,
  // Publication-grade magazine fronts.
  [gazette.name]: gazette, // broadsheet, paper-of-record serif
  [dispatch.name]: dispatch, // tech-news feed
  [metro.name]: metro, // bold asymmetric culture mosaic
  [review.name]: review, // refined longform column
  [signal.name]: signal, // vivid tech-culture hero grid
  [current.name]: current, // high-contrast electric grotesque
  [ledger.name]: ledger, // business / markets desk
  [atelier.name]: atelier, // warm-paper lifestyle quarterly
  [noir.name]: noir, // dark neon terminal
  [chronicle.name]: chronicle, // authoritative politics + economics
};

export function listThemes(): Theme[] {
  return Object.values(themes);
}

const LOGO_STYLES: LogoStyle[] = [
  "serif",
  "sans-bold",
  "condensed",
  "mono",
  "boxed",
  "underline",
  "monogram",
  "initial",
];

/** Replace a font with a Google-Fonts family named by an env override. */
function overrideFont(googleName: string): FontSpec {
  return {
    family: `'${googleName}', system-ui, -apple-system, 'Segoe UI', sans-serif`,
    // 400/700 — near-universal weights, so any Google family resolves without a
    // rejected weight from the css2 API.
    google: { name: googleName, weights: [400, 700] },
  };
}

/** Layer the logo-extracted palette as a low-priority base. Env overrides still win. */
function applyGeneratedPalette(theme: Theme): Theme {
  if (Object.keys(generatedPalette).length === 0) return theme;
  return { ...theme, colors: { ...theme.colors, ...generatedPalette } };
}

/** Layer optional per-deployment env overrides on top of a base theme. */
function applyOverrides(theme: Theme): Theme {
  const hasColorOverride = Boolean(
    env.accentColor ||
      env.secondaryColor ||
      env.popColor ||
      env.backgroundColor ||
      env.surfaceColor ||
      env.textColor ||
      env.headingColor ||
      env.linkColor ||
      env.heroFrom ||
      env.heroTo,
  );
  const hasFontOverride = Boolean(
    env.fontBody || env.fontHeading || env.fontDisplay,
  );
  const logoOverride = LOGO_STYLES.includes(env.logoStyle as LogoStyle)
    ? (env.logoStyle as LogoStyle)
    : undefined;
  if (!hasColorOverride && !hasFontOverride && !logoOverride) return theme;

  const colors = { ...theme.colors };
  if (env.accentColor) colors.primary = env.accentColor;
  if (env.secondaryColor) colors.secondary = env.secondaryColor;
  if (env.popColor) colors.accent = env.popColor;
  if (env.backgroundColor) colors.background = env.backgroundColor;
  if (env.surfaceColor) colors.surface = env.surfaceColor;
  if (env.textColor) colors.foreground = env.textColor;
  if (env.headingColor) colors.heading = env.headingColor;
  if (env.linkColor) colors.link = env.linkColor;
  if (env.heroFrom) colors.heroFrom = env.heroFrom;
  if (env.heroTo) colors.heroTo = env.heroTo;

  return {
    ...theme,
    colors,
    logo: logoOverride ?? theme.logo,
    fonts: {
      ...theme.fonts,
      display: env.fontDisplay
        ? overrideFont(env.fontDisplay)
        : theme.fonts.display,
      body: env.fontBody ? overrideFont(env.fontBody) : theme.fonts.body,
      heading: env.fontHeading
        ? overrideFont(env.fontHeading)
        : theme.fonts.heading,
    },
  };
}

/** The theme this deployment renders, selected by the `THEME` env var. */
export function getActiveTheme(): Theme {
  const industry = resolveIndustry(env.industry);

  // When SITE_INDUSTRY is set and no explicit THEME was provided, auto-select
  // the industry's preferred theme. An explicit THEME env var always wins.
  const hasExplicitTheme = Boolean(process.env.THEME);
  const industryThemeName = industry
    ? INDUSTRY_PRESETS[industry].theme
    : undefined;

  const base =
    (hasExplicitTheme ? themes[env.theme] : undefined) ??
    (industryThemeName ? themes[industryThemeName] : undefined) ??
    themes[env.theme] ??
    themes[DEFAULT_THEME];

  if (!themes[env.theme] && !industry) {
    console.warn(
      `[themes] THEME="${env.theme}" is not a known theme; falling back to "${DEFAULT_THEME}". ` +
        `Available: ${Object.keys(themes).join(", ")}.`,
    );
  }

  // Layer: base theme → logo-extracted palette → industry palette → manual env overrides (highest priority).
  const withGenerated = applyGeneratedPalette(base);
  const withIndustry = industry ? applyIndustryPreset(withGenerated, industry) : withGenerated;

  return applyOverrides(withIndustry);
}
