import type { Metadata } from "next";
import Link from "@/components/Link";
import { env } from "@/env";
import { getBrand } from "@/lib/brand";
import { bylineFor } from "@/lib/author";
import { readingTimeLabel, sectionFor, topSections } from "@/lib/editorial";
import { formatDate } from "@/lib/format";
import { getPosts } from "@/lib/letterbrace/client";
import { EmptyState } from "@/components/EmptyState";
import { StudioShell } from "@/components/studio/StudioShell";
import { StudioCover } from "@/components/studio/StudioCover";
import { StoryCard, studioHref } from "@/components/studio/StoryCard";
import { TopicFilter } from "@/components/studio/TopicFilter";

export const dynamic = "force-static";

// The redesign is a preview of the same pages: canonical stays on the live URL.
export const metadata: Metadata = {
  alternates: { canonical: "/" },
  robots: { index: false, follow: true },
};

export default async function StudioHome() {
  const brand = getBrand();
  const posts = await getPosts();
  if (posts.length === 0) {
    return (
      <StudioShell>
        <div className="s-wrap" style={{ padding: "6rem 0" }}>
          <EmptyState />
        </div>
      </StudioShell>
    );
  }

  const [lead, ...rest] = posts;
  const alsoNew = rest.slice(0, 3);
  const river = rest.slice(3);
  const topics = topSections(river, 8);
  const leadBy = bylineFor(lead);
  // The headline is the site's line; with none, its description steps up.
  const headline = env.siteTagline || brand.slogan || env.siteDescription || brand.name;
  const dek = headline === env.siteDescription ? "" : env.siteDescription;
  // A brand's blog is "The X Blog"; an independent publication names its beats.
  const eyebrow = /^https?:/.test(brand.homeUrl)
    ? `${/^the\s/i.test(brand.name) ? brand.name : `The ${brand.name}`} Blog`
    : topSections(posts, 3).join(" · ");

  return (
    <StudioShell>
      <section className="s-hero s-wrap">
        <p className="s-eyebrow">{eyebrow}</p>
        <h1 className={`s-hero-title ${headline.length > 70 ? "s-hero-title-long" : ""}`}>{headline}</h1>
        {dek && <p className="s-hero-dek">{dek}</p>}
      </section>

      <section className="s-wrap s-lead">
        <Link href={studioHref(lead)} className="s-lead-main">
          <div className="s-lead-media">
            <StudioCover post={lead} brand={brand} sizes="(min-width: 1024px) 60vw, 100vw" />
          </div>
          <div className="s-lead-text">
            <p className="s-kicker">{sectionFor(lead)}</p>
            <h2 className="s-lead-title">{lead.title}</h2>
            {lead.dek && <p className="s-lead-dek">{lead.dek}</p>}
            <p className="s-meta">
              <span>{leadBy.name}</span>
              <span aria-hidden>·</span>
              <span>{formatDate(lead.createdAt)}</span>
              <span aria-hidden>·</span>
              <span>{readingTimeLabel(lead)}</span>
            </p>
          </div>
        </Link>
        <aside className="s-lead-side" aria-label="Also new">
          <p className="s-side-label">Also new</p>
          <ol>
            {alsoNew.map((p, i) => (
              <li key={p.id}>
                <Link href={studioHref(p)}>
                  <span className="s-side-num">{String(i + 1).padStart(2, "0")}</span>
                  <span>
                    <span className="s-kicker">{sectionFor(p)}</span>
                    <span className="s-side-title">{p.title}</span>
                    <span className="s-meta">{readingTimeLabel(p)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </aside>
      </section>

      <section className="s-wrap s-river" aria-labelledby="latest">
        <div className="s-section-head">
          <h2 id="latest" className="s-section-title">
            Latest
          </h2>
        </div>
        <TopicFilter topics={topics}>
          <div className="s-grid">
            {river.map((p) => (
              <div key={p.id} data-topic={sectionFor(p)}>
                <StoryCard post={p} brand={brand} />
              </div>
            ))}
          </div>
        </TopicFilter>
      </section>
    </StudioShell>
  );
}
