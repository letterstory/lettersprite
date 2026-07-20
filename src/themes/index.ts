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
import { meridian } from "./meridian";
import { keystone } from "./keystone";
import { vantage } from "./vantage";
import { cobalt } from "./cobalt";
import { sterling } from "./sterling";
import { momentum } from "./momentum";
import { forum } from "./forum";
import { cadence } from "./cadence";
import { evergreen } from "./evergreen";
import { beacon } from "./beacon";
import { kernel } from "./kernel";
import { graphite } from "./graphite";
import { cortex } from "./cortex";
import { cipher } from "./cipher";
import { pulse } from "./pulse";

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
  // Business & corporate publications.
  [meridian.name]: meridian, // management-consulting thought leadership
  [keystone.name]: keystone, // financial-services / investment desk
  [vantage.name]: vantage, // B2B SaaS product & engineering blog
  [cobalt.name]: cobalt, // enterprise cloud/IT, carbon-dark console
  [sterling.name]: sterling, // private banking & wealth journal
  [momentum.name]: momentum, // marketing, brand & growth
  [forum.name]: forum, // economics & policy research institute
  [cadence.name]: cadence, // people, HR & future of work
  [evergreen.name]: evergreen, // corporate sustainability & ESG
  [beacon.name]: beacon, // professional services & advisory
  // Technology publications.
  [kernel.name]: kernel, // minimal developer / open-source blog
  [graphite.name]: graphite, // minimal dark writing / engineering blog
  [cortex.name]: cortex, // AI / ML research lab
  [cipher.name]: cipher, // cybersecurity / infosec desk
  [pulse.name]: pulse, // DevOps / observability
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
