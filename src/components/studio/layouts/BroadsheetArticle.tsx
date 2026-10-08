import Link from "@/components/Link";
import type { Brand } from "@/lib/brand";
import { readingTimeLabel, sectionFor } from "@/lib/editorial";
import { topicHref, studioHome, pullQuote, studioHref, type StudioArticleData } from "@/lib/studio";
import { StudioCover } from "../StudioCover";
import { CopyLink } from "../CopyLink";
import { AuthorCard, Prose, Sources } from "../parts";

function longDate(iso: string | null): string {
  return iso ? new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "";
}

/**
 * Broadsheet article: section flag, a big serif headline over a ruled byline,
 * the picture with its caption, a reading column with a pull quote, and "more
 * in this section" set as a ruled list.
 */
export function BroadsheetArticle({ brand, a }: { brand: Brand; a: StudioArticleData }) {
  const { post } = a;
  const quote = pullQuote(a.html);
  const caption = post.coverImageAlt?.split(/(?<=\.)\s/)[0];
  return (
    <>
      <div className="s-progress" aria-hidden />
      <article className="b-article">
        <header className="b-head">
          <p className="b-flag">
            <a href={topicHref(sectionFor(post))}>{sectionFor(post)}</a>
          </p>
          <h1 className="b-title">{post.title}</h1>
          {post.dek && <p className="b-dek">{post.dek}</p>}
          <div className="b-byline">
            <span>
              By <strong>{a.byline.name}</strong>
              <span className="b-byline-role">{a.byline.role}</span>
            </span>
            <span className="b-byline-date">
              {longDate(post.createdAt)} · {readingTimeLabel(post)}
            </span>
            <CopyLink />
          </div>
        </header>
        <figure className="b-figure">
          <div className="b-figure-media">
            <StudioCover post={post} brand={brand} sizes="100vw" />
          </div>
          {caption && <figcaption>{caption}</figcaption>}
        </figure>
        <div className="b-body">
          <Prose
            before={a.before}
            after={a.after}
            middle={
              quote ? (
                <figure className="b-pull">
                  <blockquote>{quote}</blockquote>
                </figure>
              ) : undefined
            }
          />
          <Sources sources={post.paperTrail} />
          <AuthorCard byline={a.byline} profile={a.profile} />
        </div>
      </article>
      {a.related.length > 0 && (
        <section className="b-more" aria-labelledby="more">
          <h2 id="more" className="b-section-title">
            More in {sectionFor(post)}
          </h2>
          <div className="b-section-row">
            {a.related.map((p) => (
              <article key={p.id} className="b-story">
                <Link href={studioHref(p)}>
                  <h3 className="b-story-title">{p.title}</h3>
                  {p.dek && <p className="b-brief-dek">{p.dek}</p>}
                  <p className="b-meta">{readingTimeLabel(p)}</p>
                </Link>
              </article>
            ))}
          </div>
          <p className="b-back">
            <Link href={studioHome()}>← Front page</Link>
          </p>
        </section>
      )}
    </>
  );
}
