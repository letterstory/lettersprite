import Link from "@/components/Link";
import { bylineFor } from "@/lib/author";
import { readingTimeLabel, readingTimeMinutes, sectionFor } from "@/lib/editorial";
import { sanitizePostHtml } from "@/lib/sanitize";
import { pullQuote, studioHref } from "@/lib/studio";
import type { Post } from "@/lib/letterbrace/types";
import { StudioCover } from "../StudioCover";
import type { HomeProps } from "./NotesHome";

/** "Essay" or "Long read": a format label, the way magazines file pieces. */
function formatLabel(p: Post): string {
  return readingTimeMinutes(p) >= 12 ? "Long read" : "Essay";
}

/**
 * Editorial magazine (Aeon, Works in Progress): a full-bleed lead with its
 * headline set over the art, a labelled three-up, a pull quote from the lead,
 * and a numbered archive.
 */
export function MagazineHome({ brand, data, eyebrow, headline }: HomeProps) {
  const [lead, ...rest] = data.posts;
  const three = rest.slice(0, 3);
  const more = rest.slice(3, 7);
  const archive = rest.slice(7);
  const quote = pullQuote(sanitizePostHtml(lead.content));
  const by = bylineFor(lead);

  return (
    <>
      <section className="m-lead">
        <Link href={studioHref(lead)} className="m-lead-link">
          <div className="m-lead-media">
            <StudioCover post={lead} brand={brand} sizes="100vw" />
          </div>
          <div className="s-wrap m-lead-caption-wrap">
            <div className="m-lead-caption">
              <p className="m-label">
                {formatLabel(lead)} <span aria-hidden>/</span> {sectionFor(lead)}
              </p>
              <h1 className="m-lead-title">{lead.title}</h1>
              {lead.dek && <p className="m-lead-dek">{lead.dek}</p>}
              <p className="s-meta">
                <span>{by.name}</span>
                <span aria-hidden>·</span>
                <span>{readingTimeLabel(lead)}</span>
              </p>
            </div>
          </div>
        </Link>
      </section>

      <section className="s-wrap m-intro">
        <p className="s-eyebrow">{eyebrow}</p>
        <p className="m-intro-text">{headline}</p>
      </section>

      <section className="s-wrap m-three" aria-label="Featured essays">
        {three.map((p) => (
          <MagazineCard key={p.id} post={p} brand={brand} />
        ))}
      </section>

      {quote && (
        <figure className="m-quote">
          <div className="s-wrap">
            <blockquote>{quote}</blockquote>
            <figcaption>
              From <Link href={studioHref(lead)}>{lead.title}</Link>
            </figcaption>
          </div>
        </figure>
      )}

      {more.length > 0 && (
        <section className="s-wrap m-three m-four" aria-label="More essays">
          {more.map((p) => (
            <MagazineCard key={p.id} post={p} brand={brand} />
          ))}
        </section>
      )}

      {archive.length > 0 && (
        <section className="s-wrap m-archive" aria-labelledby="archive">
          <h2 id="archive" className="m-section-title">
            From the archive
          </h2>
          <ol>
            {archive.map((p, i) => (
              <li key={p.id} data-topic={sectionFor(p)}>
                <Link href={studioHref(p)}>
                  <span className="m-num">{String(i + 1).padStart(2, "0")}</span>
                  <span>
                    <span className="m-label">
                      {formatLabel(p)} <span aria-hidden>/</span> {sectionFor(p)}
                    </span>
                    <span className="m-archive-title">{p.title}</span>
                    <span className="s-meta">
                      {bylineFor(p).name} · {readingTimeLabel(p)}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}
    </>
  );
}

function MagazineCard({ post, brand }: { post: Post; brand: HomeProps["brand"] }) {
  return (
    <Link href={studioHref(post)} className="m-card" data-topic={sectionFor(post)}>
      <div className="m-card-media">
        <StudioCover post={post} brand={brand} />
      </div>
      <p className="m-label">
        {formatLabel(post)} <span aria-hidden>/</span> {sectionFor(post)}
      </p>
      <h3 className="m-card-title">{post.title}</h3>
      {post.dek && <p className="m-card-dek">{post.dek}</p>}
      <p className="s-meta">
        {bylineFor(post).name} · {readingTimeLabel(post)}
      </p>
    </Link>
  );
}
