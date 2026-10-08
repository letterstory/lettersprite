import Link from "@/components/Link";
import type { Brand } from "@/lib/brand";
import { isUpdated, modifiedDate, readingTimeLabel, sectionFor } from "@/lib/editorial";
import { formatDate } from "@/lib/format";
import { env } from "@/env";
import { numberFigures, studioHref, type StudioArticleData } from "@/lib/studio";
import { CopyLink } from "../CopyLink";
import { AuthorCard, Prose } from "../parts";

/**
 * Clinical article (NEJM, STAT, Nature): article type and dates up top, a
 * summary box, numbered sections with a matching outline, numbered figures
 * captioned from their own alt text, numbered references, and how to cite it.
 */
export function ClinicalArticle({ brand, a }: { brand: Brand; a: StudioArticleData }) {
  const { post } = a;
  const sections = a.headings.filter((h) => h.level === 2);
  const year = post.createdAt ? new Date(post.createdAt).getFullYear() : "";
  const cite = `${a.byline.name}. ${post.title}. ${brand.name}. ${formatDate(post.createdAt)}.`;
  return (
    <>
      <div className="s-progress" aria-hidden />
      <article className="c-article">
        <header className="c-head">
          <div className="s-wrap">
            <p className="c-type">
              <Link href="/new">{brand.name}</Link> <span aria-hidden>·</span> {sectionFor(post)}
            </p>
            <h1 className="c-title">{post.title}</h1>
            <p className="c-authors">
              {a.byline.name}
              <span className="c-authors-role">, {a.byline.role}</span>
            </p>
            <dl className="c-dates">
              <div>
                <dt>Published</dt>
                <dd>{formatDate(post.createdAt)}</dd>
              </div>
              {isUpdated(post) && (
                <div>
                  <dt>Updated</dt>
                  <dd>{formatDate(modifiedDate(post))}</dd>
                </div>
              )}
              <div>
                <dt>Reading time</dt>
                <dd>{readingTimeLabel(post)}</dd>
              </div>
              <div className="c-dates-share">
                <CopyLink />
              </div>
            </dl>
          </div>
        </header>

        <div className="s-wrap c-grid">
          <aside className="c-rail">
            {sections.length > 1 && (
              <nav className="c-outline" aria-label="Sections">
                <p className="c-side-title">Sections</p>
                <ol>
                  {sections.map((h) => (
                    <li key={h.id}>
                      <a href={`#${h.id}`}>{h.text}</a>
                    </li>
                  ))}
                  {post.paperTrail.length > 0 && (
                    <li className="c-outline-refs">
                      <a href="#references">References</a>
                    </li>
                  )}
                </ol>
              </nav>
            )}
          </aside>
          <div className="c-body">
            {post.dek && (
              <section className="c-summary" aria-label="Summary">
                <p className="c-summary-label">Summary</p>
                <p>{post.dek}</p>
              </section>
            )}
            <div className="c-numbered">
              <Prose before={numberFigures(a.before)} after={numberFigures(a.after)} />
            </div>

            {post.paperTrail.length > 0 && (
              <section className="c-refs" aria-labelledby="references">
                <h2 id="references" className="c-refs-title">
                  References
                </h2>
                <ol>
                  {post.paperTrail.map((s) => (
                    <li key={s.url}>
                      <a href={s.url} rel="noopener" target="_blank">
                        {s.title}
                      </a>
                      {s.note && <span className="c-ref-note"> {s.note}</span>}
                    </li>
                  ))}
                </ol>
              </section>
            )}

            <section className="c-cite" aria-label="How to cite">
              <p className="c-summary-label">How to cite</p>
              <p>
                {cite} {env.siteUrl.replace(/^https?:\/\//, "")}/posts/{post.slug}
              </p>
              {year && <p className="c-cite-year">© {year} {brand.name}</p>}
            </section>
            <AuthorCard byline={a.byline} profile={a.profile} />
          </div>
        </div>
      </article>

      {a.related.length > 0 && (
        <section className="s-wrap c-related" aria-labelledby="related">
          <h2 id="related" className="c-list-title">
            Related articles
          </h2>
          <ol className="c-toc c-toc-cols">
            {a.related.map((p) => (
              <li key={p.id}>
                <Link href={studioHref(p)}>
                  <p className="c-type">{sectionFor(p)}</p>
                  <h3 className="c-toc-title">{p.title}</h3>
                  {p.dek && <p className="c-toc-dek">{p.dek}</p>}
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}
    </>
  );
}
