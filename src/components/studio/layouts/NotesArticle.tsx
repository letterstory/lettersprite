import Link from "@/components/Link";
import { studioHome } from "@/lib/studio";
import type { Brand } from "@/lib/brand";
import { sectionFor } from "@/lib/editorial";
import type { StudioArticleData } from "@/lib/studio";
import { StudioCover } from "../StudioCover";
import { TocSpy } from "../TocSpy";
import { AuthorCard, Byline, InlineAsk, Prose, RelatedGrid, Sources } from "../parts";

/**
 * Product notes article: centred header, wide cover, contents on the left, a
 * quiet sticky ask on the right (inline on narrow screens), one ask at the end.
 */
export function NotesArticle({ brand, a }: { brand: Brand; a: StudioArticleData }) {
  const { post } = a;
  return (
    <>
      <div className="s-progress" aria-hidden />
      <article className="s-article">
        <header className="s-wrap s-post-head">
          <nav className="s-crumbs" aria-label="Breadcrumb">
            <Link href={studioHome()}>Blog</Link>
            <span aria-hidden>/</span>
            <span>{sectionFor(post)}</span>
          </nav>
          <h1 className="s-post-title">{post.title}</h1>
          {post.dek && <p className="s-post-dek">{post.dek}</p>}
          <Byline byline={a.byline} post={post} align="center" />
        </header>

        <figure className="s-wrap-wide s-post-cover">
          <StudioCover post={post} brand={brand} sizes="100vw" />
        </figure>

        <div className="s-wrap s-post-grid">
          <aside className="s-post-rail">{a.headings.length > 2 && <TocSpy headings={a.headings} />}</aside>
          <div className="s-post-main">
            <Prose before={a.before} after={a.after} middle={<InlineAsk brand={brand} />} />
            <Sources sources={post.paperTrail} />
            <AuthorCard byline={a.byline} profile={a.profile} />
          </div>
          <aside className="s-post-aside" aria-label={brand.name}>
            <div className="s-aside-card">
              {brand.icon && <img src={brand.icon} alt="" className="s-aside-icon" />}
              <p className="s-aside-title">{brand.cta.headline}</p>
              <a href={brand.cta.url} className="s-button">
                {brand.cta.label}
              </a>
            </div>
          </aside>
        </div>
      </article>
      <RelatedGrid posts={a.related} brand={brand} />
    </>
  );
}
