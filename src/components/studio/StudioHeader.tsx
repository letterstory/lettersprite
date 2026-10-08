import Link from "@/components/Link";
import { studioHome, topicHref, studioBase } from "@/lib/studio";
import type { Brand } from "@/lib/brand";
import { env } from "@/env";
import { getPosts } from "@/lib/letterbrace/client";
import { sectionFor, topSections } from "@/lib/editorial";
import { Logo } from "@/components/Logo";
import { SiteSearch, type SearchItem } from "@/components/SiteSearch";

/** The site's own beats: the configured section list, else its top topics. */
function navSections(sections: string[]): string[] {
  if (env.sections) {
    return env.sections
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 7);
  }
  return sections;
}

/**
 * Two rows. The first is the site's own masthead — its mark, its links, its
 * primary button — so a company blog reads as a section of the company's
 * site. The second is the blog's own navigation: its topics and its search.
 */
export async function StudioHeader({ brand }: { brand: Brand }) {
  const posts = await getPosts();
  const sections = navSections(topSections(posts, 7));
  const index: SearchItem[] = posts.map((p) => ({
    slug: p.slug,
    title: p.title,
    section: sectionFor(p),
    excerpt: p.excerpt,
    tags: p.tags,
  }));
  const external = /^https?:/.test(brand.homeUrl);

  return (
    <header className="s-header">
      <div className="s-wrap s-header-row">
        <a href={brand.homeUrl} className="s-brand" aria-label={`${brand.name} home`}>
          {brand.logoOnLight ? (
            <img src={brand.logoOnLight} alt={brand.name} className="s-brand-logo" />
          ) : brand.icon ? (
            <>
              <img src={brand.icon} alt="" className="s-brand-icon" />
              <span className="s-brand-name">{brand.name}</span>
            </>
          ) : (
            // No measured logo: the site's own masthead mark, exactly as the
            // current design draws it.
            <Logo linked={false} size="md" />
          )}
        </a>
        {/* The blog as a section of an external site; an independent
            publication's masthead already is the blog. */}
        {external && (
          <Link href={studioHome()} className="s-header-section">
            Blog
          </Link>
        )}
        <nav className="s-header-nav" aria-label={`${brand.name} site`}>
          {brand.nav.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
          <a href={brand.cta.url} className="s-button">
            {brand.cta.label}
          </a>
        </nav>
      </div>
      <div className="s-subnav">
        <div className="s-wrap s-subnav-row">
          <nav className="s-topics" aria-label="Topics">
            <a href={`${studioHome()}#latest`}>All</a>
            {sections.map((s) => (
              <a key={s} href={topicHref(s)}>
                {s}
              </a>
            ))}
          </nav>
          <SiteSearch index={index} hrefBase={`${studioBase()}/posts/`} className="s-search" placeholder="Search" />
        </div>
      </div>
    </header>
  );
}
