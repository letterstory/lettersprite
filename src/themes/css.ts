import type { CSSProperties } from "react";
import type { Theme } from "./types";

/**
 * Serialize a theme's tokens into CSS custom properties. These are applied as
 * an inline `style` on <html>, which guarantees they win over the stylesheet
 * defaults regardless of load order and inherit to the whole document.
 */
export function themeToCssVars(theme: Theme): CSSProperties {
  const c = theme.colors;
  const vars: Record<string, string> = {
    "--bg": c.background,
    "--surface": c.surface,
    "--fg": c.foreground,
    "--muted": c.muted,
    "--border": c.border,
    "--primary": c.primary,
    "--primary-fg": c.primaryForeground,
    "--link": c.link ?? c.primary,
    "--heading-color": c.heading ?? c.foreground,
    "--font-body": theme.fonts.body.family,
    "--font-heading": theme.fonts.heading.family,
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
 * uses, de-duplicated by family. Returns null when the theme uses only system
 * fonts (no network request needed).
 */
export function googleFontsHref(theme: Theme): string | null {
  const byName = new Map<string, Set<number>>();
  for (const spec of [theme.fonts.body, theme.fonts.heading, theme.fonts.mono]) {
    if (!spec.google) continue;
    const set = byName.get(spec.google.name) ?? new Set<number>();
    spec.google.weights.forEach((w) => set.add(w));
    byName.set(spec.google.name, set);
  }
  if (byName.size === 0) return null;

  const families = [...byName.entries()].map(([name, weights]) => {
    const family = name.replace(/ /g, "+");
    const w = [...weights].sort((a, b) => a - b).join(";");
    return `family=${family}:wght@${w}`;
  });
  return `https://fonts.googleapis.com/css2?${families.join("&")}&display=swap`;
}
