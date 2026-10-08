import Link from "@/components/Link";
import { bylineFor } from "@/lib/author";
import { readingTimeLabel, sectionFor } from "@/lib/editorial";
import { formatDate } from "@/lib/format";
import { studioHref } from "@/lib/studio";
import type { HomeProps } from "./NotesHome";

/**
 * Minimal essay (HEY World, Substack): one centred column, what the
 * publication is and how to follow it, then the writing — no image grid.
 */
export function EssayHome({ brand, data, headline, dek }: HomeProps) {
  return (
    <div className="e-col">
      <section className="e-intro">
        <h1 className="e-intro-title">{headline}</h1>
        {dek && <p className="e-intro-dek">{dek}</p>}
        <p className="e-follow">
          <a href={brand.cta.url} className="s-button">
            {brand.cta.label}
          </a>
          <span className="s-meta">
            {data.stats.posts} pieces · {data.stats.topics} topics
          </span>
        </p>
      </section>
      <ol className="e-list">
        {data.posts.map((p) => (
          <li key={p.id} data-topic={sectionFor(p)}>
            <Link href={studioHref(p)} className="e-item">
              <span className="e-item-meta">
                <time dateTime={p.createdAt ?? undefined}>{formatDate(p.createdAt)}</time>
                <span aria-hidden>·</span>
                <span>{sectionFor(p)}</span>
              </span>
              <span className="e-item-title">{p.title}</span>
              {p.dek && <span className="e-item-dek">{p.dek}</span>}
              <span className="e-item-more">
                {bylineFor(p).name} · {readingTimeLabel(p)} <span aria-hidden>→</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
