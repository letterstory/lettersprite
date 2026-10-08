import Link from "@/components/Link";
import type { Brand } from "@/lib/brand";
import { isUpdated, modifiedDate, readingTimeLabel, sectionFor } from "@/lib/editorial";
import { formatDate } from "@/lib/format";
import type { StudioArticleData } from "@/lib/studio";
import { StudioCover } from "../StudioCover";
import { TocSpy } from "../TocSpy";
import { CopyLink } from "../CopyLink";
import { AuthorCard, InlineAsk, Prose, Sources } from "../parts";
import { studioHref } from "@/lib/studio";

/**
 * Research journal article (Ahrefs, Intercom): a left-aligned header with a
 * credits table, "what this covers" up front, contents rail, and the sources
 * framed as the method — the article shows its work.
 */
export function JournalArticle({ brand, a }: { brand: Brand; a: StudioArticleData }) {
  const { post } = a;
  const covers = a.headings.filter((h) => h.level === 2).slice(0, 4);
  return (
    <>
      <div className="s-progress" aria-hidden />
      <article className="s-article">
        <header className="s-wrap j-head">
          <nav className="s-crumbs" aria-label="Breadcrumb">
            <Link href="/new">Research</Link>
            <span aria-hidden>/</span>
            <a href={`/new?topic=${encodeURIComponent(sectionFor(post))}`}>{sectionFor(post)}</a>
          </nav>
          <div className="j-head-grid">
            <div>
              <h1 className="j-post-title">{post.title}</h1>
              {post.dek && <p className="j-post-dek">{post.dek}</p>}
            </div>
            <div className="j-head-media">
              <StudioCover post={post} brand={brand} />
            </div>
          </div>
          <dl className="j-credits">
            <div>
              <dt>Written by</dt>
              <dd>
                <span className="s-avatar s-avatar-sm" aria-hidden>
                  {a.byline.initials}
                </span>
                <span>
                  {a.byline.name}
                  <span className="j-credit-sub">{a.byline.role}</span>
                </span>
              </dd>
            </div>
            <div>
              <dt>{isUpdated(post) ? "Updated" : "Published"}</dt>
              <dd>{formatDate(isUpdated(post) ? modifiedDate(post) : post.createdAt)}</dd>
            </div>
            <div>
              <dt>Reading time</dt>
              <dd>{readingTimeLabel(post)}</dd>
            </div>
            {post.paperTrail.length > 0 && (
              <div>
                <dt>Sources cited</dt>
                <dd>
                  <a href="#sources">{post.paperTrail.length} sources ↓</a>
                </dd>
              </div>
            )}
            <div className="j-credits-share">
              <CopyLink />
            </div>
          </dl>
        </header>

        <div className="s-wrap s-post-grid j-grid">
          <aside className="s-post-rail">{a.headings.length > 2 && <TocSpy headings={a.headings} />}</aside>
          <div className="s-post-main">
            {covers.length >= 3 && (
              <div className="j-covers">
                <p className="j-label">What this covers</p>
                <ol>
                  {covers.map((h) => (
                    <li key={h.id}>
                      <a href={`#${h.id}`}>{h.text}</a>
                    </li>
                  ))}
                </ol>
              </div>
            )}
            <Prose
              before={a.before}
              after={a.after}
              middle={brand.ask === "product" ? <InlineAsk brand={brand} /> : undefined}
            />
            <Sources sources={post.paperTrail} title="Methodology & sources" />
            <AuthorCard byline={a.byline} profile={a.profile} />
          </div>
        </div>
      </article>

      {a.related.length > 0 && (
        <section className="s-wrap j-related" aria-labelledby="related">
          <h2 id="related" className="j-label">
            Related research
          </h2>
          <ol className="j-list j-list-cols">
            {a.related.map((p) => (
              <li key={p.id}>
                <Link href={studioHref(p)} className="j-row">
                  <span className="s-kicker">{sectionFor(p)}</span>
                  <span className="j-row-title">{p.title}</span>
                  {p.dek && <span className="j-row-dek">{p.dek}</span>}
                  <span className="s-meta">{readingTimeLabel(p)}</span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}
    </>
  );
}
