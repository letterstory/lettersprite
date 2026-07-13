import type { CSSProperties } from "react";
import type { Theme } from "./types";

/**
 * Serialize a theme's tokens into CSS custom properties. These are applied as
 * an inline `style` on <html>, which guarantees they win over the stylesheet
 * defaults regardless of load order and inherit to the whole document.
 *
 * Only the raw palette is emitted here; derived tones (tints, soft text, pill
 * backgrounds) are computed from these in CSS via `color-mix` (see
 * `globals.css`) so themes stay lean and every deployment gets a coherent set
 * of dynamic surfaces for free.
 */
export function themeToCssVars(theme: Theme): CSSProperties {
  const c = theme.colors;
  const secondary = c.secondary ?? c.primary;
  const accent = c.accent ?? secondary;
  const vars: Record<string, string> = {
    "--bg": c.background,
    "--surface": c.surface,
    "--surface-alt": c.surfaceAlt ?? c.surface,
    "--fg": c.foreground,
    "--muted": c.muted,
    "--border": c.border,
    "--primary": c.primary,
    "--primary-fg": c.primaryForeground,
    "--secondary": secondary,
    "--accent": accent,
    "--link": c.link ?? c.primary,
    "--heading-color": c.heading ?? c.foreground,
    "--kicker": c.kicker ?? c.primary,
    "--hero-from": c.heroFrom ?? c.primary,
    "--hero-to": c.heroTo ?? accent,
    "--font-display": (theme.fonts.display ?? theme.fonts.heading).family,
    "--font-heading": theme.fonts.heading.family,
    "--font-body": theme.fonts.body.family,
    "--font-mono": theme.fonts.mono.family,
    "--radius": theme.radius,
    "--content-width": theme.contentWidth,
    "--container-width": theme.containerWidth,
  };
  // colorScheme is a real CSS property; it keeps form controls/scrollbars in sync.
  return { ...vars, colorScheme: theme.colorScheme } as CSSProperties;
}

/**
 * Build a single Google Fonts stylesheet URL covering every web font the theme
 * uses, de-duplicated by family. Weights and (optionally) the italic axis are
 * merged per family. Returns null when the theme uses only system fonts.
 */
export function googleFontsHref(theme: Theme): string | null {
  type Acc = { weights: Set<number>; italic: boolean };
  const byName = new Map<string, Acc>();
  const specs = [
    theme.fonts.display,
    theme.fonts.heading,
    theme.fonts.body,
    theme.fonts.mono,
  ];
  for (const spec of specs) {
    if (!spec?.google) continue;
    const acc = byName.get(spec.google.name) ?? {
      weights: new Set<number>(),
      italic: false,
    };
    spec.google.weights.forEach((w) => acc.weights.add(w));
    if (spec.google.italic) acc.italic = true;
    byName.set(spec.google.name, acc);
  }
  if (byName.size === 0) return null;

  const families = [...byName.entries()].map(([name, acc]) => {
    const family = name.replace(/ /g, "+");
    const weights = [...acc.weights].sort((a, b) => a - b);
    if (acc.italic) {
      // ital,wght@0,400;0,700;1,400;1,700 — regular then italic for each weight.
      const tuples = [
        ...weights.map((w) => `0,${w}`),
        ...weights.map((w) => `1,${w}`),
      ].join(";");
      return `family=${family}:ital,wght@${tuples}`;
    }
    return `family=${family}:wght@${weights.join(";")}`;
  });
  return `https://fonts.googleapis.com/css2?${families.join("&")}&display=swap`;
}
