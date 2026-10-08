import Link from "@/components/Link";
import type { Brand } from "@/lib/brand";
import { readingTimeMinutes, sectionFor } from "@/lib/editorial";
import { pullQuote, type StudioArticleData } from "@/lib/studio";
import { StudioCover } from "../StudioCover";
import { AuthorCard, Byline, Prose, RelatedGrid, Sources } from "../parts";

/**
 * Editorial magazine article (Aeon, Works in Progress): a full-bleed art header,
 * a centred serif title, a left rail with the writer and the filing, a large
 * serif body with a drop cap, and a pull quote set between sections.
 */
export function MagazineArticle({ brand, a }: { brand: Brand; a: StudioArticleData }) {
  const { post } = a;
  const quote = pullQuote(a.html);
  return (
    <>
      <div className="s-progress" aria-hidden />
      <article className="s-article m-article">
        <figure className="m-hero">
          <StudioCover post={post} brand={brand} sizes="100vw" />
        </figure>
        <header className="s-wrap m-head">
          <p className="m-label">
            {readingTimeMinutes(post) >= 12 ? "Long read" : "Essay"} <span aria-hidden>/</span>{" "}
            <a href={`/new?topic=${encodeURIComponent(sectionFor(post))}`}>{sectionFor(post)}</a>
          </p>
          <h1 className="m-title">{post.title}</h1>
          {post.dek && <p className="m-dek">{post.dek}</p>}
          <Byline byline={a.byline} post={post} align="center" />
        </header>

        <div className="s-wrap m-grid">
          <aside className="m-rail">
            <div className="m-rail-inner">
              <p className="m-rail-label">Words by</p>
              <p className="m-rail-name">{a.byline.name}</p>
              <p className="m-rail-bio">{a.profile.bio}</p>
              <p className="m-rail-label">Filed under</p>
              <p>
                <a href={`/new?topic=${encodeURIComponent(sectionFor(post))}`}>{sectionFor(post)}</a>
              </p>
              <p className="m-rail-label">Length</p>
              <p>{a.words.toLocaleString("en-US")} words</p>
            </div>
          </aside>
          <div className="m-body">
            <Prose
              before={a.before}
              after={a.after}
              middle={
                quote ? (
                  <figure className="m-inline-quote">
                    <blockquote>{quote}</blockquote>
                  </figure>
                ) : undefined
              }
            />
            <Sources sources={post.paperTrail} title="Notes" />
            <AuthorCard byline={a.byline} profile={a.profile} />
            <p className="m-end">
              <Link href="/new">← Back to {brand.name}</Link>
            </p>
          </div>
        </div>
      </article>
      <RelatedGrid posts={a.related} brand={brand} title="More essays" />
    </>
  );
}
