import Link from "@/components/Link";
import type { Brand } from "@/lib/brand";
import { readingTimeLabel, sectionFor } from "@/lib/editorial";
import { formatDate } from "@/lib/format";
import { studioHref, type StudioHomeData } from "@/lib/studio";
import { StoryCard } from "../StoryCard";
import { StudioCover } from "../StudioCover";
import { TopicFilter } from "../TopicFilter";
import { ArchiveList } from "../parts";

/**
 * Product notes (Linear Now, Vercel, Stripe): a short hero, three featured
 * stories with art, a filterable grid, then a dense text-only archive.
 */
export function NotesHome({ brand, data, eyebrow, headline, dek }: HomeProps) {
  const [a, b, c, ...rest] = data.posts;
  const featured = [a, b, c].filter(Boolean);
  const grid = rest.slice(0, 9);
  const archive = rest.slice(9, 33);
  return (
    <>
      <section className="s-hero s-hero-compact s-wrap">
        <p className="s-eyebrow">{eyebrow}</p>
        <h1 className={`s-hero-title ${headline.length > 70 ? "s-hero-title-long" : ""}`}>{headline}</h1>
        {dek && <p className="s-hero-dek">{dek}</p>}
      </section>

      <section className="s-wrap n-featured" aria-label="Featured">
        {featured.map((p, i) => (
          <Link key={p.id} href={studioHref(p)} className={`n-feature ${i === 0 ? "n-feature-lead" : ""}`}>
            <div className="n-feature-media">
              <StudioCover post={p} brand={brand} />
            </div>
            <div className="n-feature-body">
              <p className="s-kicker">{sectionFor(p)}</p>
              <h2 className="n-feature-title">{p.title}</h2>
              {i === 0 && p.dek && <p className="s-card-dek">{p.dek}</p>}
              <p className="s-meta">
                <span>{formatDate(p.createdAt)}</span>
                <span aria-hidden>·</span>
                <span>{readingTimeLabel(p)}</span>
              </p>
            </div>
          </Link>
        ))}
      </section>

      <section className="s-wrap s-river" aria-labelledby="latest">
        <div className="s-section-head">
          <h2 id="latest" className="s-section-title">
            Latest
          </h2>
        </div>
        <TopicFilter topics={data.sections}>
          <div className="s-grid">
            {grid.map((p) => (
              <div key={p.id} data-topic={sectionFor(p)}>
                <StoryCard post={p} brand={brand} />
              </div>
            ))}
          </div>
          <ArchiveList posts={archive} />
        </TopicFilter>
      </section>
    </>
  );
}

export interface HomeProps {
  brand: Brand;
  data: StudioHomeData;
  eyebrow: string;
  headline: string;
  dek: string;
}
