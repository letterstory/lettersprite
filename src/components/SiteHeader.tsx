import Link from "next/link";
import { env } from "@/env";
import { getActiveTheme } from "@/themes";
import { getPosts } from "@/lib/letterbrace/client";
import { editionDate, sectionHref, topSections } from "@/lib/editorial";
import type { Post } from "@/lib/letterbrace/types";
import { Logo } from "./Logo";

/**
 * The masthead. Two archetypes, chosen by the theme so different deployments
 * read like different outlets:
 *  - "classic"  — a centered flag with an edition dateline and rules above a
 *                 slim sticky section bar (broadsheet / longform).
 *  - "modern"   — a left wordmark with inline nav and a Subscribe button in one
 *                 sticky bar (tech / culture fronts).
 * Sections are real links to `/sections/[slug]` index pages.
 */

/** Format a deterministic ISO date as a masthead edition line. */
function formatEdition(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function navSections(posts: Post[]): string[] {
  if (env.sections) {
    return env.sections
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 7);
  }
  return topSections(posts, 9);
}

/**
 * How many section links sit inline before the rest collapse into a "More"
 * menu. A young phantom can own 7-9 pillars; rendered flat they overflow the
 * masthead and read as a packed wall of tiny caps. Capping the inline set keeps
 * the bar legible; the overflow stays reachable in a no-JS disclosure.
 */
const MAX_INLINE_SECTIONS = 5;

function SubscribeButton({ compact = false }: { compact?: boolean }) {
  if (!env.newsletterEnabled) return null;
  return (
    <a
      href="#newsletter"
      className={`pill-solid rounded-[var(--radius)] ${
        compact ? "px-3.5 py-1.5" : "px-4 py-2"
      }`}
    >
      Subscribe
    </a>
  );
}

function SectionLink({ section }: { section: string }) {
  return (
    <Link
      href={sectionHref(section)}
      className="kicker kicker-muted ul-link shrink-0 whitespace-nowrap py-0.5 hover:text-primary"
    >
      {section}
    </Link>
  );
}

/**
 * The masthead section bar. Shows up to MAX_INLINE_SECTIONS links, then folds
 * the remainder into a "More" disclosure (a native <details>, so it needs no
 * client JS and survives the static build). The row wraps rather than scrolls,
 * so the dropdown is never clipped and narrow screens degrade to spaced rows.
 * `align` positions the overflow panel under the bar (right for a left nav,
 * centered for a centered masthead).
 */
function SectionNav({
  sections,
  className = "",
  align = "start",
}: {
  sections: string[];
  className?: string;
  align?: "start" | "center";
}) {
  const inline = sections.slice(0, MAX_INLINE_SECTIONS);
  const overflow = sections.slice(MAX_INLINE_SECTIONS);
  return (
    <nav
      aria-label="Sections"
      className={`flex flex-wrap items-center gap-x-6 gap-y-1 ${className}`}
    >
      {inline.map((s) => (
        <SectionLink key={s} section={s} />
      ))}
      {overflow.length > 0 && (
        <details className="group relative shrink-0">
          <summary className="kicker kicker-muted ul-link flex cursor-pointer list-none items-center gap-1 whitespace-nowrap py-0.5 hover:text-primary [&::-webkit-details-marker]:hidden">
            More
            <span aria-hidden className="text-[0.85em] transition-transform group-open:rotate-180">
              ▾
            </span>
          </summary>
          <ul
            className={`absolute top-full z-50 mt-2 flex min-w-44 flex-col gap-0.5 rounded-[var(--radius)] border border-border bg-background p-1.5 shadow-lg ${
              align === "center" ? "left-1/2 -translate-x-1/2" : "right-0"
            }`}
          >
            {overflow.map((s) => (
              <li key={s}>
                <Link
                  href={sectionHref(s)}
                  className="kicker kicker-muted block whitespace-nowrap rounded-[calc(var(--radius)-0.15rem)] px-3 py-1.5 hover:bg-muted/10 hover:text-primary"
                >
                  {s}
                </Link>
              </li>
            ))}
          </ul>
        </details>
      )}
    </nav>
  );
}

export async function SiteHeader() {
  const theme = getActiveTheme();
  const posts = await getPosts();
  const sections = navSections(posts);
  const edition = formatEdition(editionDate(posts));
  const centered =
    theme.home === "broadsheet" ||
    theme.home === "column" ||
    Boolean(theme.features?.centeredMasthead);
  const topRule = theme.features?.topRule ?? centered;

  if (centered) {
    return (
      <header className="no-print border-b border-border bg-background">
        {topRule && <div className="hero-wash h-1 w-full" />}
        <div className="container-wide px-6">
          {/* Utility row: edition dateline · subscribe */}
          <div className="flex items-center justify-between border-b border-border py-2 text-[0.7rem] text-muted">
            <span className="hidden font-heading uppercase tracking-widest sm:inline">
              {edition}
            </span>
            <span className="font-heading uppercase tracking-widest sm:hidden">
              {env.siteTagline || "Est."}
            </span>
            <SubscribeButton compact />
          </div>
          {/* The flag */}
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <Logo size="xl" />
            {env.siteTagline && (
              <p className="max-w-xl font-heading text-xs uppercase tracking-[0.28em] text-muted">
                {env.siteTagline}
              </p>
            )}
          </div>
        </div>
        {/* Sticky section bar */}
        <div className="sticky top-0 z-50 border-y border-border bg-background/85 backdrop-blur-md">
          <div className="container-wide px-6">
            <SectionNav
              sections={sections}
              align="center"
              className="justify-center py-2.5 text-center"
            />
          </div>
        </div>
      </header>
    );
  }

  // Modern: single sticky bar, left wordmark + nav + subscribe.
  return (
    <header className="no-print sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      {topRule && <div className="hero-wash h-1 w-full" />}
      <div className="container-wide flex items-center justify-between gap-6 px-6 py-3.5">
        <Logo size="md" />
        <div className="flex items-center gap-6">
          <SectionNav sections={sections} className="hidden md:flex" />
          <SubscribeButton />
        </div>
      </div>
      {/* Section nav wraps to its own row on small screens */}
      <div className="border-t border-border md:hidden">
        <div className="container-wide px-6">
          <SectionNav sections={sections} className="py-2" />
        </div>
      </div>
    </header>
  );
}
