import type { Metadata } from "next";
import Link from "@/components/Link";
import { notFound } from "next/navigation";
import { getBrand } from "@/lib/brand";
import { authorProfile, authorsFromPosts, bylineFor } from "@/lib/author";
import { readingTimeLabel, sectionFor } from "@/lib/editorial";
import { formatDate } from "@/lib/format";
import { getPostBySlug, getPosts } from "@/lib/letterbrace/client";
import { relatedPosts } from "@/lib/related";
import { sanitizePostHtml } from "@/lib/sanitize";
import { buildToc } from "@/lib/toc";
import { StudioShell } from "@/components/studio/StudioShell";
import { StudioCover } from "@/components/studio/StudioCover";
import { StoryCard } from "@/components/studio/StoryCard";
import { TocSpy } from "@/components/studio/TocSpy";
import { CopyLink } from "@/components/studio/CopyLink";

type Params = { params: Promise<{ slug: string }> };

export const dynamic = "force-static";
export const dynamicParams = false;

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt || undefined,
    // A preview of the live post: never compete with it in search.
    alternates: { canonical: `/posts/${post.slug}` },
    robots: { index: false, follow: true },
  };
}

/**
 * Split the body before the h2 nearest its midpoint, so a brand call-to-action
 * can sit between two sections instead of interrupting a paragraph. Returns the
 * whole body as `before` when there is no suitable heading.
 */
function splitAtMiddleSection(html: string): { before: string; after: string } {
  const starts = [...html.matchAll(/<h2\b/gi)].map((m) => m.index ?? 0).filter((i) => i > 0);
  if (starts.length < 3) return { before: html, after: "" };
  const mid = html.length * 0.5;
  const at = starts.reduce((best, i) => (Math.abs(i - mid) < Math.abs(best - mid) ? i : best));
  return { before: html.slice(0, at), after: html.slice(at) };
}

export default async function StudioPost({ params }: Params) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const brand = getBrand();
  const all = await getPosts();
  const related = relatedPosts(post, all, 3);
  const byline = bylineFor(post);
  const authorPosts = authorsFromPosts(all).find((a) => a.slug === byline.slug)?.posts ?? [post];
  const profile = authorProfile(byline, [...new Set(authorPosts.map((p) => sectionFor(p).toLowerCase()))]);
  const { html, headings } = buildToc(sanitizePostHtml(post.content));
  const { before, after } = splitAtMiddleSection(html);
  const sources = post.paperTrail;

  return (
    <StudioShell>
      <div className="s-progress" aria-hidden />
      <article className="s-article">
        <header className="s-wrap s-post-head">
          <nav className="s-crumbs" aria-label="Breadcrumb">
            <Link href="/new">Blog</Link>
            <span aria-hidden>/</span>
            <span>{sectionFor(post)}</span>
          </nav>
          <h1 className="s-post-title">{post.title}</h1>
          {post.dek && <p className="s-post-dek">{post.dek}</p>}
          <div className="s-byline">
            <span className="s-avatar" aria-hidden>
              {byline.initials}
            </span>
            <span className="s-byline-text">
              <span className="s-byline-name">{byline.name}</span>
              <span className="s-meta">
                {formatDate(post.createdAt)} <span aria-hidden>·</span> {readingTimeLabel(post)}
              </span>
            </span>
            <span className="s-byline-actions">
              <CopyLink />
            </span>
          </div>
        </header>

        <figure className="s-wrap-wide s-post-cover">
          <StudioCover post={post} brand={brand} sizes="100vw" />
        </figure>

        <div className="s-wrap s-post-grid">
          <aside className="s-post-rail">{headings.length > 2 && <TocSpy headings={headings} />}</aside>
          <div className="s-post-main">
            <div className="s-prose" dangerouslySetInnerHTML={{ __html: before }} />
            {after && (
              <>
                <aside className="s-inline-cta" aria-label={brand.name}>
                  {brand.icon && (
                    <img src={brand.icon} alt="" className="s-inline-cta-icon" />
                  )}
                  <div>
                    <p className="s-inline-cta-title">{brand.cta.headline}</p>
                    <a href={brand.cta.url} className="s-inline-cta-link">
                      {brand.cta.label} <span aria-hidden>→</span>
                    </a>
                  </div>
                </aside>
                <div className="s-prose" dangerouslySetInnerHTML={{ __html: after }} />
              </>
            )}

            {sources.length > 0 && (
              <section className="s-sources" aria-labelledby="sources">
                <h2 id="sources" className="s-sources-title">
                  Sources
                </h2>
                <ol>
                  {sources.map((s) => (
                    <li key={s.url}>
                      <a href={s.url} rel="noopener" target="_blank">
                        {s.title}
                      </a>
                      {s.note && <p>{s.note}</p>}
                    </li>
                  ))}
                </ol>
              </section>
            )}

            <section className="s-author">
              <span className="s-avatar s-avatar-lg" aria-hidden>
                {byline.initials}
              </span>
              <div>
                <p className="s-author-name">{byline.name}</p>
                <p className="s-author-role">{byline.role}</p>
                <p className="s-author-bio">{profile.bio}</p>
              </div>
            </section>
          </div>
          <aside className="s-post-aside" aria-label={brand.name}>
            <div className="s-aside-card">
              {brand.icon && (
                <img src={brand.icon} alt="" className="s-aside-icon" />
              )}
              <p className="s-aside-title">{brand.cta.headline}</p>
              <a href={brand.cta.url} className="s-button">
                {brand.cta.label}
              </a>
            </div>
          </aside>
        </div>
      </article>

      {related.length > 0 && (
        <section className="s-wrap s-related" aria-labelledby="keep-reading">
          <div className="s-section-head">
            <h2 id="keep-reading" className="s-section-title">
              Keep reading
            </h2>
            <Link href="/new" className="s-section-more">
              All posts →
            </Link>
          </div>
          <div className="s-grid">
            {related.map((p) => (
              <StoryCard key={p.id} post={p} brand={brand} />
            ))}
          </div>
        </section>
      )}
    </StudioShell>
  );
}
