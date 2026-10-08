import Link from "@/components/Link";
import type { Brand } from "@/lib/brand";
import { readingTimeLabel, sectionFor } from "@/lib/editorial";
import { formatDate } from "@/lib/format";
import { studioHref, type StudioArticleData } from "@/lib/studio";
import { StudioCover } from "../StudioCover";
import { AuthorCard, Byline, Prose, Sources } from "../parts";

/**
 * Minimal essay article: one narrow column from top to bottom, the cover as a
 * figure inside it, footnoted sources, a single follow ask, more writing below.
 */
export function EssayArticle({ brand, a }: { brand: Brand; a: StudioArticleData }) {
  const { post } = a;
  return (
    <>
      <div className="s-progress" aria-hidden />
      <article className="e-col e-article">
        <header className="e-head">
          <p className="e-item-meta">
            <Link href="/new">{brand.name}</Link>
            <span aria-hidden>·</span>
            <span>{sectionFor(post)}</span>
          </p>
          <h1 className="e-title">{post.title}</h1>
          {post.dek && <p className="e-dek">{post.dek}</p>}
          <Byline byline={a.byline} post={post} />
        </header>
        <figure className="e-figure">
          <StudioCover post={post} brand={brand} />
        </figure>
        <Prose before={a.before} after={a.after} />
        <Sources sources={post.paperTrail} title="Notes" />
        <div className="e-thanks">
          <p className="e-thanks-title">{brand.cta.headline}</p>
          <a href={brand.cta.url} className="s-button">
            {brand.cta.label}
          </a>
        </div>
        <AuthorCard byline={a.byline} profile={a.profile} />
        {a.related.length > 0 && (
          <section className="e-more" aria-labelledby="more">
            <h2 id="more" className="e-more-title">
              More from {brand.name}
            </h2>
            <ol className="e-list">
              {a.related.map((p) => (
                <li key={p.id}>
                  <Link href={studioHref(p)} className="e-item">
                    <span className="e-item-meta">{formatDate(p.createdAt)}</span>
                    <span className="e-item-title">{p.title}</span>
                    <span className="e-item-more">{readingTimeLabel(p)} →</span>
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        )}
      </article>
    </>
  );
}
