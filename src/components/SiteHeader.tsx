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
  return topSections(posts, 6);
}

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

function SectionNav({
  sections,
  className = "",
}: {
  sections: string[];
  className?: string;
}) {
  return (
    <nav
      aria-label="Sections"
      className={`flex items-center gap-x-5 gap-y-1 overflow-x-auto ${className}`}
    >
      {sections.map((s) => (
        <Link
          key={s}
          href={sectionHref(s)}
          className="kicker kicker-muted ul-link shrink-0 whitespace-nowrap py-0.5 hover:text-primary"
        >
          {s}
        </Link>
      ))}
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
      <header className="border-b border-border bg-background">
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
              className="justify-center py-2.5 text-center"
            />
          </div>
        </div>
      </header>
    );
  }

  // Modern: single sticky bar, left wordmark + nav + subscribe.
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
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
