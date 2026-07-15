import Link from "next/link";
import { env } from "@/env";
import { getActiveTheme } from "@/themes";
import type { LogoStyle } from "@/themes/types";

/**
 * The masthead "logo" — a purely typographic treatment of `SITE_TITLE`, chosen
 * by the theme's `logo` style. No image asset: font, weight, tracking, case and
 * a small ornament are enough to turn a plain title into something that reads
 * like a real publication's flag. Rendered at build time, identical every load.
 */

type Size = "sm" | "md" | "lg" | "xl";

const SIZE: Record<Size, string> = {
  sm: "text-xl",
  md: "text-2xl",
  lg: "text-4xl",
  xl: "text-5xl sm:text-6xl",
};

function initials(title: string): string {
  const words = title
    .replace(/^(the|a|an)\s+/i, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return env.siteTitle.trim().slice(0, 2).toUpperCase() || "·";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

function firstLetter(title: string): string {
  const clean = title.replace(/^(the|a|an)\s+/i, "").trim();
  return (clean[0] ?? title[0] ?? "·").toUpperCase();
}

/** The inner wordmark markup for a given style (no link wrapper). */
function Mark({ style, size }: { style: LogoStyle; size: Size }) {
  const title = env.siteTitle;
  const scale = SIZE[size];

  switch (style) {
    case "serif":
      // 800 (not 900): the weight every serif-logo theme actually loads.
      return (
        <span
          className={`font-display font-extrabold leading-none tracking-[-0.02em] ${scale}`}
          style={{ fontVariantLigatures: "common-ligatures" }}
        >
          {title}
        </span>
      );

    case "sans-bold":
      return (
        <span
          className={`font-heading font-extrabold lowercase leading-none tracking-[-0.04em] ${scale}`}
        >
          {title}
        </span>
      );

    case "condensed":
      return (
        <span
          className={`font-heading font-bold uppercase leading-none tracking-[0.12em] ${scale}`}
        >
          {title}
        </span>
      );

    case "mono":
      return (
        <span
          className={`font-mono font-bold leading-none tracking-[-0.02em] ${scale}`}
        >
          <span className="text-primary">/</span>
          {title.replace(/\s+/g, "_").toLowerCase()}
          <span className="ml-0.5 inline-block w-[0.5ch] translate-y-[0.05em] bg-primary align-baseline text-transparent select-none">
            .
          </span>
        </span>
      );

    case "boxed":
      return (
        <span
          className={`inline-block bg-primary px-2.5 py-1 font-heading font-extrabold uppercase leading-none tracking-tight text-primary-foreground ${scale}`}
        >
          {title}
        </span>
      );

    case "underline":
      return (
        <span
          className={`relative font-display font-extrabold leading-none tracking-tight ${scale}`}
        >
          {title}
          <span className="absolute -bottom-1.5 left-0 h-[3px] w-full bg-primary" />
        </span>
      );

    case "monogram":
      // 700: the heaviest weight the monogram themes' heading fonts load.
      return (
        <span className="inline-flex items-center gap-2.5">
          <span
            className={`inline-flex aspect-square items-center justify-center bg-primary px-2 font-heading font-bold leading-none text-primary-foreground ${scale}`}
            style={{ borderRadius: "var(--radius)" }}
          >
            {initials(title)}
          </span>
          <span
            className={`font-heading font-bold leading-none tracking-tight ${scale}`}
          >
            {title}
          </span>
        </span>
      );

    case "initial":
      // Single oversized first letter as a publication mark — reads as a real
      // masthead initial (cf. The Atlantic "A", Esquire "E") rather than an avatar.
      // The outer span sets the base size via `scale`; the letter and wordmark
      // are sized relative to it with em units so all four sizes stay proportional.
      return (
        <span className={`inline-flex items-baseline ${scale}`}>
          <span
            className="font-display font-extrabold leading-none tracking-[-0.04em] text-primary"
            style={{ fontSize: "1.35em" }}
            aria-hidden="true"
          >
            {firstLetter(title)}
          </span>
          <span
            className="ml-[0.06em] border-l-2 border-primary pl-[0.2em] font-display font-extrabold leading-none tracking-[-0.02em]"
            style={{ fontSize: "0.55em" }}
          >
            {title}
          </span>
        </span>
      );
  }
}

export function Logo({
  size = "sm",
  className = "",
  linked = true,
  style,
}: {
  size?: Size;
  className?: string;
  linked?: boolean;
  style?: LogoStyle;
}) {
  const resolved = style ?? getActiveTheme().logo;
  const mark = (
    <span className={`inline-block text-heading ${className}`}>
      <Mark style={resolved} size={size} />
    </span>
  );
  if (!linked) return mark;
  return (
    <Link href="/" aria-label={env.siteTitle} className="inline-block">
      {mark}
    </Link>
  );
}
