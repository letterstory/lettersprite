import { env } from "@/env";
import { getActiveTheme } from "@/themes";
import { getPosts } from "@/lib/letterbrace/client";
import { editionDate, topSections, sectionFor } from "@/lib/editorial";
import type { Post } from "@/lib/letterbrace/types";
import { Logo } from "./Logo";
import { SectionNav } from "./SectionNav";
import { SiteSearch, type SearchItem } from "./SiteSearch";

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


export async function SiteHeader() {
  const theme = getActiveTheme();
  const posts = await getPosts();
  const sections = navSections(posts);
  const searchIndex: SearchItem[] = posts.map((p) => ({
    slug: p.slug,
    title: p.title,
    section: sectionFor(p),
    excerpt: p.excerpt,
    tags: p.tags,
  }));
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
            <div className="flex items-center justify-center gap-4 py-2.5">
              <SectionNav
                sections={sections}
                align="center"
                className="justify-center text-center"
              />
              <SiteSearch index={searchIndex} className="hidden w-56 shrink-0 lg:block" />
            </div>
            {/* Full-width search on small screens where the inline box is hidden */}
            <div className="border-t border-border pb-3 pt-2 lg:hidden">
              <SiteSearch index={searchIndex} />
            </div>
          </div>
        </div>
      </header>
    );
  }

  // Modern: single sticky bar, left wordmark + nav + subscribe.
  return (
    <header className="no-print sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      {topRule && <div className="hero-wash h-1 w-full" />}
      <div className="container-wide flex items-center gap-6 px-6 py-3.5">
        <Logo size="md" />
        {/* Nav takes the middle and is width-bounded (flex-1 min-w-0) so it can
            measure how many sections fit and fold the rest into "More". */}
        <SectionNav sections={sections} className="hidden min-w-0 flex-1 md:flex" />
        <SiteSearch index={searchIndex} className="hidden w-52 shrink-0 md:block" />
        <SubscribeButton />
      </div>
      {/* Section nav + search wrap to their own rows on small screens */}
      <div className="border-t border-border md:hidden">
        <div className="container-wide px-6">
          <SectionNav sections={sections} className="py-2" />
          <SiteSearch index={searchIndex} className="pb-3" />
        </div>
      </div>
    </header>
  );
}
