import { env } from "@/env";
import type { FontSpec, LogoStyle, Theme } from "./types";
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
import { verdure } from "./verdure";
import { couture } from "./couture";
import { atlas } from "./atlas";
import { missive } from "./missive";
import { commit } from "./commit";
import { apex } from "./apex";
import { mint } from "./mint";
import { bloom } from "./bloom";
import { cinder } from "./cinder";
import { hearth } from "./hearth";
import { harvest } from "./harvest";
import { terra } from "./terra";
import { verve } from "./verve";
import { estate } from "./estate";
import { counsel } from "./counsel";
import { clinic } from "./clinic";
import { nook } from "./nook";
import { lumen } from "./lumen";
import { cellar } from "./cellar";
import { horizon } from "./horizon";

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
  // Brand & product publications — a wide spread of verticals, five of them on
  // brand-new home layouts (cover / gallery / digest / timeline / board).
  [verdure.name]: verdure, // nutrition & wellness pinboard (board)
  [couture.name]: couture, // high-fashion magazine cover (cover)
  [atlas.name]: atlas, // travel & exploration gallery (gallery)
  [missive.name]: missive, // personal newsletter digest (digest)
  [commit.name]: commit, // engineering changelog timeline (timeline)
  [apex.name]: apex, // athletic performance, dark cinematic
  [mint.name]: mint, // consumer fintech, rounded grid
  [bloom.name]: bloom, // beauty editorial, blush grid
  [cinder.name]: cinder, // gaming & esports, neon mosaic
  [hearth.name]: hearth, // interior design & architecture
  [harvest.name]: harvest, // food & recipe mosaic
  [terra.name]: terra, // sustainability & climate longform
  [verve.name]: verve, // music & pop culture mosaic
  [estate.name]: estate, // luxury real estate hero
  [counsel.name]: counsel, // professional-services thought leadership
  [clinic.name]: clinic, // healthcare & biotech feed
  [nook.name]: nook, // parenting & family, cozy grid
  [lumen.name]: lumen, // science & ideas feature feed
  [cellar.name]: cellar, // craft coffee & beverage journal
  [horizon.name]: horizon, // B2B SaaS product marketing, glossy gradient
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
  const base = themes[env.theme];
  if (!base) {
    console.warn(
      `[themes] THEME="${env.theme}" is not a known theme; falling back to "${DEFAULT_THEME}". ` +
        `Available: ${Object.keys(themes).join(", ")}.`,
    );
  }
  return applyOverrides(base ?? themes[DEFAULT_THEME]);
}
