import { env } from "@/env";
import { getActiveTheme } from "@/themes";
import type { FontSpec } from "@/themes/types";

/**
 * The customer's brand, resolved into the handful of decisions the `/new`
 * redesign makes. The input is the measured brand profile Letterbrace already
 * keeps per org (`org_brand_profiles`: colors, fonts, logos, button styling and
 * the site's own links), passed through `SITE_BRAND_JSON`. Nothing here is
 * invented: a missing field falls back to the active theme, never to a guess.
 */

interface RawFont {
  family?: string;
  google?: boolean;
  fallbacks?: string[];
  category?: string;
}

interface RawLogo {
  url: string;
  mode?: string; // "light" | "dark" | "has_opaque_background"
  type?: string; // "logo" | "icon"
  width?: number;
  height?: number;
}

interface RawBrand {
  name?: string;
  domain?: string;
  identity?: { name?: string; slogan?: string; description?: string };
  visual?: {
    colors?: Partial<Record<"text" | "accent" | "primary" | "secondary" | "background", string>>;
    logos?: RawLogo[];
    bodyFont?: RawFont;
    headingFont?: RawFont;
    components?: {
      buttonPrimary?: { backgroundColor?: string; color?: string; borderRadius?: string };
      card?: { borderRadius?: string };
    };
  };
  links?: Record<string, string | null>;
  socials?: { type: string; url: string }[];
  cta?: { label?: string; url?: string; headline?: string };
}

export interface BrandNavLink {
  label: string;
  href: string;
}

export interface Brand {
  name: string;
  /** Home page of the customer's own site. */
  homeUrl: string;
  slogan: string;
  description: string;
  colors: {
    paper: string;
    ink: string;
    /** The brand's primary — links, kickers, rules. */
    accent: string;
    /** A louder second hue for fills and covers. */
    accent2: string;
    /** A soft tint for washes and highlights. */
    tint: string;
    /** Button fill as the brand's own site draws it. */
    button: string;
    buttonText: string;
  };
  fonts: { heading: string; body: string; googleHref: string | null };
  radius: string;
  /** Mark for light backgrounds (an icon), and a logotype for dark ones. */
  icon: string | null;
  logoOnDark: string | null;
  logoOnLight: string | null;
  /** Inline SVG mark (SITE_LOGO_SVG) when no image logo exists — a phantom's. */
  logoSvg: string | null;
  nav: BrandNavLink[];
  footerLinks: BrandNavLink[];
  socials: { type: string; url: string }[];
  cta: { label: string; url: string; headline: string };
}

const NAV_LABELS: Record<string, string> = {
  pricing: "Pricing",
  blog: "Blog",
  careers: "Careers",
  contact: "Contact",
  docs: "Docs",
};
const FOOTER_LABELS: Record<string, string> = {
  ...NAV_LABELS,
  terms: "Terms",
  privacy: "Privacy",
};

function parse(): RawBrand | null {
  if (!env.brandJson) return null;
  try {
    return JSON.parse(env.brandJson) as RawBrand;
  } catch {
    console.error("[brand] SITE_BRAND_JSON is not valid JSON; using the theme");
    return null;
  }
}

function fontStack(font: RawFont | undefined, fallback: string): string {
  if (!font?.family) return fallback;
  const rest = (font.fallbacks ?? []).filter((f) => f !== font.family);
  return [font.family, ...rest].map((f) => (/\s/.test(f) ? `"${f}"` : f)).join(", ");
}

function googleHref(fonts: (RawFont | undefined)[]): string | null {
  const families = [
    ...new Set(fonts.filter((f) => f?.google && f.family).map((f) => f!.family!)),
  ];
  if (families.length === 0) return null;
  const q = families
    .map((f) => `family=${encodeURIComponent(f).replace(/%20/g, "+")}:ital,wght@0,400;0,500;0,600;0,700;1,400`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${q}&display=swap`;
}

function links(raw: RawBrand, labels: Record<string, string>, skip: string[] = []): BrandNavLink[] {
  return Object.entries(raw.links ?? {})
    .filter(([k, v]) => v && labels[k] && !skip.includes(k))
    .map(([k, v]) => ({ label: labels[k], href: v! }));
}

function themeStack(f: FontSpec | undefined, fallback: string): string {
  return f?.family || fallback;
}

let cached: Brand | null = null;

export function getBrand(): Brand {
  if (cached) return cached;
  const raw = parse() ?? {};
  const theme = getActiveTheme();
  const t = theme.colors;
  // With no measured brand, the identity is the site's own (a phantom's art-
  // directed theme): links point home within the blog, the closer invites
  // readers to the about page, and fonts are the theme's (already loaded).
  const own = parse() === null;
  const c = raw.visual?.colors ?? {};
  const btn = raw.visual?.components?.buttonPrimary;
  const name = raw.identity?.name || raw.name || env.siteTitle;
  const homeUrl = raw.domain ? `https://${raw.domain.replace(/^https?:\/\//, "")}` : "/new";
  const logos = raw.visual?.logos ?? [];

  cached = {
    name,
    homeUrl,
    slogan: raw.identity?.slogan || env.siteTagline,
    description: raw.identity?.description || env.siteDescription,
    colors: {
      paper: c.background || t.background,
      ink: btn?.backgroundColor || c.text || t.foreground,
      accent: c.primary || t.primary,
      accent2: c.secondary || c.primary || t.secondary || t.primary,
      tint: c.accent || t.surface,
      button: btn?.backgroundColor || c.text || t.primary,
      buttonText: btn?.color || c.background || t.primaryForeground,
    },
    fonts: {
      heading: raw.visual?.headingFont
        ? fontStack(raw.visual.headingFont, "Georgia, serif")
        : themeStack(theme.fonts.display ?? theme.fonts.heading, "Georgia, serif"),
      body: raw.visual?.bodyFont
        ? fontStack(raw.visual.bodyFont, "system-ui, sans-serif")
        : themeStack(theme.fonts.body, "system-ui, sans-serif"),
      googleHref: googleHref([raw.visual?.headingFont, raw.visual?.bodyFont]),
    },
    radius: btn?.borderRadius || "8px",
    icon: logos.find((l) => l.type === "icon")?.url ?? null,
    logoOnDark: logos.find((l) => l.type === "logo" && l.mode === "dark")?.url ?? null,
    logoOnLight: logos.find((l) => l.type === "logo" && l.mode !== "dark")?.url ?? null,
    logoSvg: env.logoSvg || null,
    nav: links(raw, NAV_LABELS, ["blog"]),
    footerLinks: links(raw, FOOTER_LABELS),
    socials: raw.socials ?? [],
    cta: own
      ? {
          label: "About us",
          url: "/about",
          headline: env.siteTagline || env.siteDescription || name,
        }
      : {
          label: raw.cta?.label || `Visit ${name}`,
          url: raw.cta?.url || homeUrl,
          headline: raw.cta?.headline || raw.identity?.slogan || env.siteTagline || name,
        },
  };
  return cached;
}

/** CSS custom properties for the redesign's root element. */
export function brandCssVars(b: Brand): Record<string, string> {
  return {
    "--b-paper": b.colors.paper,
    "--b-ink": b.colors.ink,
    "--b-accent": b.colors.accent,
    "--b-accent-2": b.colors.accent2,
    "--b-tint": b.colors.tint,
    "--b-button": b.colors.button,
    "--b-button-text": b.colors.buttonText,
    "--b-font-heading": b.fonts.heading,
    "--b-font-body": b.fonts.body,
    "--b-radius": b.radius,
  };
}
