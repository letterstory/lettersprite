import { Fragment } from "react";
import Link from "@/components/Link";
import { env } from "@/env";
import { getActiveTheme } from "@/themes";
import { getPosts } from "@/lib/letterbrace/client";
import { editionDate, topSections, sectionFor, sectionHref } from "@/lib/editorial";
import type { Post } from "@/lib/letterbrace/types";
import { EditionDate } from "./EditionDate";
import { Logo } from "./Logo";
import { ModeToggle } from "./ModeToggle";
import { SectionNav } from "./SectionNav";
import { SiteSearch, type SearchItem } from "./SiteSearch";
import { StickyMasthead } from "./StickyMasthead";

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

  // Mature technical-editorial masthead: a monospace dateline strip that
  // scrolls away, above a sticky main bar (wordmark, pill section nav, search,
  // subscribe). A swipeable mono section strip on small screens.
  if (theme.features?.wireMasthead) {
    const trending = searchIndex.slice(0, 6);
    const tagline =
      env.siteTagline || "APIs, integration & security — in depth";
    return (
      <header className="no-print bg-background">
        {topRule && <div className="hero-wash h-0.5 w-full" />}
        {/* Dateline strip. */}
        <div className="border-b border-border">
          <div className="container-wide flex items-center justify-between px-6 py-1.5">
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted">
              {tagline}
            </span>
            <span className="hidden font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted sm:inline">
              {edition}
            </span>
          </div>
        </div>
        {/* Sticky main bar. */}
        <div className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
          <div className="container-wide px-6">
            <div className="flex items-center gap-4 py-4">
              <Logo size="md" className="shrink-0" />
              <nav className="mx-auto hidden items-center rounded-full border border-border p-1 lg:flex">
                {sections.map((s) => (
                  <Link
                    key={s}
                    href={sectionHref(s)}
                    className="whitespace-nowrap rounded-full px-3.5 py-1.5 font-mono text-xs uppercase tracking-wider text-muted transition-colors hover:bg-surface hover:text-primary"
                  >
                    {s}
                  </Link>
                ))}
              </nav>
              <div className="ml-auto flex shrink-0 items-center gap-3">
                <SiteSearch index={searchIndex} trending={trending} className="w-44 sm:w-56" />
                <a
                  href="#newsletter"
                  className="hidden whitespace-nowrap rounded-full bg-primary px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-[color:var(--primary-fg)] transition-opacity hover:opacity-90 sm:inline-block"
                >
                  Subscribe
                </a>
              </div>
            </div>
          </div>
          {/* Swipeable mono section strip on < lg. */}
          {sections.length > 0 && (
            <nav aria-label="Sections" className="swipe-x border-t border-border lg:hidden">
              <div className="flex w-max gap-5 px-6 py-2.5">
                {sections.map((s) => (
                  <Link
                    key={s}
                    href={sectionHref(s)}
                    className="shrink-0 whitespace-nowrap font-mono text-xs uppercase tracking-wider text-muted transition-colors hover:text-primary"
                  >
                    {s}
                  </Link>
                ))}
              </div>
            </nav>
          )}
        </div>
      </header>
    );
  }

  // Editorial "Atlantic" masthead: a centered serif flag with flanking rules
  // and a star ornament, section nav on the left, a prominent search box (with
  // a Trending dropdown) on the right, plus a minimized sticky bar on scroll.
  if (theme.features?.atlanticMasthead) {
    const trending = searchIndex.slice(0, 6);
    return (
      <header className="no-print relative z-20 border-b border-border bg-background">
        <StickyMasthead
          title={env.siteTitle}
          searchIndex={searchIndex}
          trending={trending}
        />
        {topRule && <div className="hero-wash h-1 w-full" />}

        {/* Utility bar: a prominent keyboard-native search box ("/" or ⌘K to
            focus, with a Trending dropdown), right-aligned. */}
        <div className="container-wide px-6">
          <div className="flex items-center justify-end py-3">
            <SiteSearch
              index={searchIndex}
              trending={trending}
              className="w-full max-w-sm"
            />
          </div>
        </div>

        {/* Centered serif flag with flanking rules + star ornament. */}
        <div className="container-wide px-6 pb-5 pt-1">
          <Link
            href="/"
            aria-label={env.siteTitle}
            className="flex items-center justify-center gap-6"
          >
            <span aria-hidden className="hidden h-px flex-1 bg-border sm:block" />
            <span className="text-center font-display text-[2rem] font-bold leading-none tracking-tight text-primary sm:text-[2.6rem] lg:text-[3rem]">
              {env.siteTitle}
            </span>
            <span aria-hidden className="hidden h-px flex-1 bg-border sm:block" />
          </Link>
          {env.siteTagline && (
            <div className="mt-3 flex items-center justify-center gap-2.5 text-xs">
              <span className="text-[color:var(--secondary)]">★</span>
              <span className="text-primary">★</span>
              <span className="font-display italic text-muted">
                {env.siteTagline}
              </span>
              <span className="text-primary">★</span>
              <span className="text-[color:var(--secondary)]">★</span>
            </div>
          )}
        </div>

        {/* Section bar: EVERY section, centered on wide screens and
            finger-swipeable when it overflows — so no section is cut off on
            phones. */}
        {sections.length > 0 && (
          <div className="border-t border-border">
            <div className="container-wide px-6 py-2.5">
              <SectionNav sections={sections} align="center" />
            </div>
          </div>
        )}
      </header>
    );
  }

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
              {/* `align="center"` already centres (safely); a plain
                  `justify-center` here would override it and re-break the
                  overflow case. */}
              <SectionNav
                sections={sections}
                align="center"
                className="text-center"
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

  // grafill-style: a serif wordmark with inline serif section nav and a search
  // + subscribe on the right, in one slim bar.
  // Culture-news: a utility bar with a wide search, a centered wordmark, then a
  // centered uppercase category nav.
  if (theme.features?.blitzMasthead) {
    return (
      <header
        data-blitz-masthead
        className="no-print sticky top-0 z-50 bg-background/95 backdrop-blur-md"
      >
        {/* Row 1 — utility bar: a wide prominent search, subscribe on the right. */}
        <div className="border-b border-border">
          <div data-hero-hide className="container-wide flex items-center gap-4 px-6 py-2.5">
            <EditionDate className="hidden shrink-0 text-[0.7rem] font-medium uppercase tracking-[0.14em] text-muted lg:inline" />
            <SiteSearch index={searchIndex} className="min-w-0 flex-1" />
            <div className="flex shrink-0 items-center gap-4">
              <SubscribeButton compact />
            </div>
          </div>
        </div>
        {/* Row 2 — brand row: menu + socials left · centered wordmark · moon right. */}
        <div className="border-b border-border">
          <div className="container-wide grid grid-cols-[1fr_auto_1fr] items-center px-6 py-3.5">
            <div className="flex items-center gap-4 justify-self-start text-heading">
              <span aria-hidden className="flex flex-col gap-[3px]">
                <span className="block h-[2px] w-5 bg-current" />
                <span className="block h-[2px] w-5 bg-current" />
                <span className="block h-[2px] w-5 bg-current" />
              </span>
              {env.twitterHandle && (
                <a
                  href={`https://x.com/${env.twitterHandle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="X"
                  className="hidden text-muted transition-colors hover:text-heading sm:block"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
                    <path d="M18.9 1.6h3.5l-7.6 8.7L23.7 22h-7l-5.5-7.2L4.9 22H1.4l8.1-9.3L.7 1.6h7.2l5 6.6 5.9-6.6Zm-1.2 18.3h1.9L6.9 3.6H4.8l12.9 16.3Z" />
                  </svg>
                </a>
              )}
            </div>
            <Logo size="md" className="justify-self-center" />
            <div className="flex items-center justify-self-end">
              <ModeToggle />
            </div>
          </div>
        </div>
        {/* Row 3 — centered uppercase category nav. */}
        {sections.length > 0 && (
          <div className="border-b border-border">
            <nav
              aria-label="Sections"
              className="container-wide flex justify-start gap-7 overflow-x-auto whitespace-nowrap px-6 py-2.5 [-ms-overflow-style:none] [scrollbar-width:none] sm:justify-center [&::-webkit-scrollbar]:hidden"
            >
              {sections.map((s) => (
                <Link
                  key={s}
                  href={sectionHref(s)}
                  className="shrink-0 text-[0.72rem] font-medium uppercase tracking-[0.1em] text-heading transition-colors hover:text-primary"
                >
                  {s}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>
    );
  }

  // Classic journal masthead: a centered emblem, double rules, a big
  // letter-spaced serif wordmark flanked by Vol./Est., and a dotted section nav.
  if (theme.features?.quartoMasthead) {
    const ink = "var(--secondary)"; // navy — the masthead ink
    const initials = env.siteTitle
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w[0])
      .join("")
      .slice(0, 3)
      .toUpperCase();
    const Rule = () => (
      <div aria-hidden style={{ borderTop: `1.5px solid ${ink}` }} />
    );
    return (
      <header
        data-quarto-masthead
        className="no-print bg-background"
      >
        {/* Emblem — the deployment logo (SITE_LOGO_SVG, in lockstep with the
            favicon) when set, else an original monogram roundel fallback. */}
        <div className="mx-auto flex max-w-5xl justify-center px-6 pb-5 pt-8">
          <Link href="/" aria-label={env.siteTitle} className="block h-24 w-24">
            {env.logoSvg ? (
              <span
                className="block h-24 w-24 [&>svg]:h-full [&>svg]:w-full"
                dangerouslySetInnerHTML={{ __html: env.logoSvg }}
              />
            ) : (
              <span
                className="flex h-24 w-24 items-center justify-center rounded-full font-display text-2xl font-semibold tracking-[0.02em]"
                style={{ border: `2.5px solid ${ink}`, color: ink }}
                aria-hidden
              >
                {initials}
              </span>
            )}
          </Link>
        </div>
        <Rule />
        {/* Big centered wordmark, flanked by Vol. / Est. */}
        <div className="mx-auto max-w-5xl px-6">
          <div className="relative py-6">
            <span className="absolute left-0 top-1/2 hidden -translate-y-1/2 text-[0.72rem] uppercase tracking-[0.16em] text-muted sm:block">
              Vol.&nbsp;I
            </span>
            <Link
              href="/"
              className="mx-auto block max-w-3xl text-center font-display text-4xl font-semibold uppercase leading-[1.04] tracking-[0.05em] sm:text-5xl md:text-[3.4rem]"
              style={{ color: ink }}
            >
              {env.siteTitle}
            </Link>
            <span className="absolute right-0 top-1/2 hidden -translate-y-1/2 text-[0.72rem] uppercase tracking-[0.16em] text-muted sm:block">
              Est.&nbsp;2026
            </span>
          </div>
        </div>
        <Rule />
        {/* Dotted section nav — spans the full width, evenly spread. */}
        {sections.length > 0 && (
          <nav
            aria-label="Sections"
            className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 px-6 py-3 text-[0.68rem] font-semibold uppercase tracking-[0.12em]"
            style={{ color: ink }}
          >
            {sections.map((s, i) => (
              <Fragment key={s}>
                {i > 0 && (
                  <span aria-hidden className="text-muted">
                    •
                  </span>
                )}
                <Link
                  href={sectionHref(s)}
                  className="whitespace-nowrap transition-colors hover:text-primary"
                >
                  {s}
                </Link>
              </Fragment>
            ))}
          </nav>
        )}
        <Rule />
      </header>
    );
  }

  // syg.ma-style: a minimal single bar — small wordmark, inline section nav,
  // search + subscribe. Understated, system type.
  if (theme.features?.commonsMasthead) {
    return (
      <header
        data-commons-masthead
        className="no-print sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md"
      >
        <div className="container-wide flex items-center gap-6 px-6 py-3">
          <Logo size="sm" className="shrink-0" />
          <div data-hero-hide className="hidden shrink-0 sm:block">
            <SiteSearch
              index={searchIndex}
              bare
              bareSize="sm"
              placeholder="Search"
              className="w-36"
            />
          </div>
          <nav className="hidden items-center gap-5 md:flex">
            {sections.map((s) => (
              <Link
                key={s}
                href={sectionHref(s)}
                className="whitespace-nowrap text-[0.82rem] text-muted transition-colors hover:text-primary"
              >
                {s}
              </Link>
            ))}
          </nav>
          <div className="ml-auto shrink-0">
            <SubscribeButton compact />
          </div>
        </div>
        {sections.length > 0 && (
          <nav aria-label="Sections" className="swipe-x border-t border-border md:hidden">
            <div className="flex w-max gap-4 px-6 py-2">
              {sections.map((s) => (
                <Link
                  key={s}
                  href={sectionHref(s)}
                  className="shrink-0 whitespace-nowrap text-sm text-muted transition-colors hover:text-primary"
                >
                  {s}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </header>
    );
  }

  // Franklin Azzi-style spread: a three-part row (nav — centered wordmark — nav),
  // a ghosted centered search, then an understated uppercase section-tab row.
  if (theme.features?.vitrineMasthead) {
    const flankL = sections[0];
    const flankR = sections.length > 1 ? sections[sections.length - 1] : undefined;
    return (
      <header data-vitrine-masthead className="no-print bg-background">
        <div className="container-wide grid grid-cols-3 items-center gap-4 px-6 pb-5 pt-7">
          <div className="justify-self-start">
            {flankL && (
              <Link
                href={sectionHref(flankL)}
                className="font-display text-sm font-bold uppercase tracking-[0.1em] text-heading transition-colors hover:text-primary"
              >
                {flankL}
              </Link>
            )}
          </div>
          <div className="justify-self-center">
            <Logo size="md" />
          </div>
          <div className="justify-self-end">
            {flankR && (
              <Link
                href={sectionHref(flankR)}
                className="font-display text-sm font-bold uppercase tracking-[0.1em] text-heading transition-colors hover:text-primary"
              >
                {flankR}
              </Link>
            )}
          </div>
        </div>
        {/* Centered SEARCH with a hairline running along both sides. */}
        <div data-hero-hide className="container-wide flex items-center gap-6 px-6 pb-7 pt-1">
          <span aria-hidden className="h-px flex-1 bg-border" />
          <SiteSearch index={searchIndex} bare placeholder="Search" className="w-64 shrink-0" />
          <span aria-hidden className="h-px flex-1 bg-border" />
        </div>
        {sections.length > 0 && (
          <div className="border-y border-border">
            <nav
              aria-label="Sections"
              className="container-wide flex flex-wrap items-center justify-center gap-x-10 gap-y-2 px-6 py-2.5"
            >
              {sections.map((s) => (
                <Link
                  key={s}
                  href={sectionHref(s)}
                  className="font-mono text-[0.64rem] uppercase tracking-[0.16em] text-muted transition-colors hover:text-primary"
                >
                  {s}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>
    );
  }

  // Taste-style newsstand: a wordmark + utility row, then an uppercase,
  // horizontally scrollable section nav on its own line.
  if (theme.features?.kioskMasthead) {
    return (
      <header data-kiosk-masthead className="no-print sticky top-0 z-50 bg-background/95 backdrop-blur-md">
        {/* Dateline strip — reads as a real publication of record. */}
        <div className="border-b border-border/70">
          <div className="container-wide flex items-center justify-center px-6 py-2 font-mono text-[0.64rem] uppercase tracking-[0.22em] text-muted">
            {edition}
          </div>
        </div>
        <div className="border-b border-border">
          <div className="container-wide grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-6 py-5">
            <span aria-hidden />
            <Logo size="md" className="justify-self-center" />
            <div data-hero-hide className="flex shrink-0 items-center gap-4 justify-self-end">
              <SiteSearch index={searchIndex} className="hidden w-48 md:block" />
              <SubscribeButton />
            </div>
          </div>
        </div>
        {sections.length > 0 && (
          <div className="border-b border-border">
            <nav
              aria-label="Sections"
              className="container-wide flex gap-7 overflow-x-auto whitespace-nowrap px-6 py-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {sections.map((s) => (
                <Link
                  key={s}
                  href={sectionHref(s)}
                  className="shrink-0 font-mono text-[0.72rem] font-bold uppercase tracking-[0.16em] text-heading/75 transition-colors hover:text-primary"
                >
                  {s}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>
    );
  }

  if (theme.features?.folioMasthead) {
    return (
      <header data-folio-masthead className="no-print sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="container-wide flex items-center gap-6 px-6 py-4">
          <Logo size="md" className="shrink-0" />
          <nav className="hidden items-center gap-6 lg:flex">
            {sections.map((s) => (
              <Link
                key={s}
                href={sectionHref(s)}
                className="whitespace-nowrap font-display text-[0.98rem] leading-none text-heading transition-colors hover:text-primary"
              >
                {s}
              </Link>
            ))}
          </nav>
          <div data-hero-hide className="ml-auto flex shrink-0 items-center gap-4">
            <SiteSearch index={searchIndex} className="hidden w-44 md:block" />
            <SubscribeButton />
          </div>
        </div>
        {/* Section strip on small screens. */}
        {sections.length > 0 && (
          <nav aria-label="Sections" className="swipe-x border-t border-border lg:hidden">
            <div className="flex w-max gap-5 px-6 py-2.5">
              {sections.map((s) => (
                <Link
                  key={s}
                  href={sectionHref(s)}
                  className="shrink-0 whitespace-nowrap font-display text-sm text-heading transition-colors hover:text-primary"
                >
                  {s}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </header>
    );
  }

  // Creative Boom-style: a wordmark row, then a full-width, horizontally
  // scrollable topic bar on its own line so long section names all fit and
  // stay reachable.
  if (theme.features?.boomMasthead) {
    return (
      <header className="no-print sticky top-0 z-50 bg-background/90 backdrop-blur-md">
        <div className="border-b border-border">
          <div className="container-wide flex items-center justify-between gap-6 px-6 py-4">
            <Logo size="md" />
            <div className="flex items-center gap-4">
              <SiteSearch index={searchIndex} className="hidden w-56 sm:block" />
              <SubscribeButton />
            </div>
          </div>
        </div>
        <div className="border-b border-border">
          <nav className="container-wide flex gap-7 overflow-x-auto whitespace-nowrap px-6 py-2.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {sections.map((s) => (
              <Link
                key={s}
                href={sectionHref(s)}
                className="shrink-0 text-[0.78rem] font-semibold uppercase tracking-wide text-heading/75 transition-colors hover:text-primary"
              >
                {s}
              </Link>
            ))}
          </nav>
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
