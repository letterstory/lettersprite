import Link from "@/components/Link";
import { bylineFor } from "@/lib/author";
import { readingTimeLabel, sectionFor } from "@/lib/editorial";
import { formatDate } from "@/lib/format";
import type { Post } from "@/lib/letterbrace/types";
import { topicHref, studioHref } from "@/lib/studio";
import { StudioCover } from "../StudioCover";
import type { HomeProps } from "./NotesHome";

/**
 * Clinical (NEJM, STAT, Nature): calm and exact. A summary-led featured piece,
 * the rest as a journal table of contents — type, title, summary, authors,
 * date — and a topic index beside it.
 */
export function ClinicalHome({ brand, data, eyebrow, headline, dek }: HomeProps) {
  const [lead, ...rest] = data.posts;
  return (
    <>
      <section className="c-masthead">
        <div className="s-wrap c-masthead-row">
          <div>
            <p className="c-type">{eyebrow}</p>
            <h1 className="c-masthead-title">{headline}</h1>
            {dek && <p className="c-masthead-dek">{dek}</p>}
          </div>
        </div>
      </section>

      <div className="s-wrap c-home">
        <div className="c-main">
          <Link href={studioHref(lead)} className="c-featured">
            <div className="c-featured-media">
              <StudioCover post={lead} brand={brand} />
            </div>
            <div>
              <p className="c-type">
                Featured <span aria-hidden>·</span> {sectionFor(lead)}
              </p>
              <h2 className="c-featured-title">{lead.title}</h2>
              {lead.dek && (
                <p className="c-abstract">
                  <span className="c-abstract-label">Summary</span> {lead.dek}
                </p>
              )}
              <ClinicalMeta post={lead} />
            </div>
          </Link>

          <h2 className="c-list-title" id="latest">
            Latest articles
          </h2>
          <ol className="c-toc">
            {rest.map((p) => (
              <li key={p.id} data-topic={sectionFor(p)}>
                <Link href={studioHref(p)}>
                  <p className="c-type">{sectionFor(p)}</p>
                  <h3 className="c-toc-title">{p.title}</h3>
                  {p.dek && <p className="c-toc-dek">{p.dek}</p>}
                  <ClinicalMeta post={p} />
                </Link>
              </li>
            ))}
          </ol>
        </div>

        <aside className="c-side" aria-labelledby="topics">
          <div className="c-side-inner">
            <h2 id="topics" className="c-side-title">
              Browse by topic
            </h2>
            <ul>
              {data.sections.map((s) => (
                <li key={s}>
                  <a href={topicHref(s)}>{s}</a>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </>
  );
}

function ClinicalMeta({ post }: { post: Post }) {
  return (
    <p className="c-meta">
      <span>{bylineFor(post).name}</span>
      <span aria-hidden>·</span>
      <time dateTime={post.createdAt ?? undefined}>{formatDate(post.createdAt)}</time>
      <span aria-hidden>·</span>
      <span>{readingTimeLabel(post)}</span>
    </p>
  );
}
