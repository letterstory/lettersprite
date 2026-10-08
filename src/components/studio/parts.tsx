import type { ReactNode } from "react";
import Link from "@/components/Link";
import type { Brand } from "@/lib/brand";
import type { Byline as BylineData, AuthorProfile } from "@/lib/author";
import { readingTimeLabel, sectionFor } from "@/lib/editorial";
import { formatDate } from "@/lib/format";
import type { PaperTrailSource, Post } from "@/lib/letterbrace/types";
import { studioHome, studioHref } from "@/lib/studio";
import { StoryCard } from "./StoryCard";
import { CopyLink } from "./CopyLink";

/** Avatar, name, role and dateline. The role is part of the credit, not decoration. */
export function Byline({
  byline,
  post,
  share = true,
  align = "start",
}: {
  byline: BylineData;
  post: Post;
  share?: boolean;
  align?: "start" | "center";
}) {
  return (
    <div className={`s-byline s-byline-${align}`}>
      <span className="s-avatar" aria-hidden>
        {byline.initials}
      </span>
      <span className="s-byline-text">
        <span className="s-byline-name">
          {byline.name}
          <span className="s-byline-role"> · {byline.role}</span>
        </span>
        <span className="s-meta">
          {formatDate(post.createdAt)} <span aria-hidden>·</span> {readingTimeLabel(post)}
        </span>
      </span>
      {share && (
        <span className="s-byline-actions">
          <CopyLink />
        </span>
      )}
    </div>
  );
}

export function Sources({ sources, title = "Sources" }: { sources: PaperTrailSource[]; title?: string }) {
  if (sources.length === 0) return null;
  return (
    <section className="s-sources" aria-labelledby="sources">
      <h2 id="sources" className="s-sources-title">
        {title}
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
  );
}

export function AuthorCard({ byline, profile }: { byline: BylineData; profile: AuthorProfile }) {
  return (
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
  );
}

/** A brand moment between two sections; a follow ask on independent sites. */
export function InlineAsk({ brand }: { brand: Brand }) {
  return (
    <aside className="s-inline-cta" aria-label={brand.name}>
      {brand.icon && <img src={brand.icon} alt="" className="s-inline-cta-icon" />}
      <div>
        <p className="s-inline-cta-title">{brand.cta.headline}</p>
        <a href={brand.cta.url} className="s-inline-cta-link">
          {brand.cta.label} <span aria-hidden>→</span>
        </a>
      </div>
    </aside>
  );
}

/** The article body, with an optional moment set between its two halves. */
export function Prose({ before, after, middle }: { before: string; after: string; middle?: ReactNode }) {
  return (
    <>
      <div className="s-prose" dangerouslySetInnerHTML={{ __html: before }} />
      {after && (
        <>
          {middle}
          <div className="s-prose" dangerouslySetInnerHTML={{ __html: after }} />
        </>
      )}
    </>
  );
}

export function RelatedGrid({ posts, brand, title = "Keep reading" }: { posts: Post[]; brand: Brand; title?: string }) {
  if (posts.length === 0) return null;
  return (
    <section className="s-wrap s-related" aria-labelledby="keep-reading">
      <div className="s-section-head">
        <h2 id="keep-reading" className="s-section-title">
          {title}
        </h2>
        <Link href={studioHome()} className="s-section-more">
          All posts →
        </Link>
      </div>
      <div className="s-grid">
        {posts.map((p) => (
          <StoryCard key={p.id} post={p} brand={brand} />
        ))}
      </div>
    </section>
  );
}

/** A dense, text-only list of posts: the archive register under the features. */
export function ArchiveList({ posts, title = "Archive" }: { posts: Post[]; title?: string }) {
  if (posts.length === 0) return null;
  return (
    <section className="s-wrap s-archive" aria-labelledby="archive">
      <h2 id="archive" className="s-section-title">
        {title}
      </h2>
      <ol>
        {posts.map((p) => (
          <li key={p.id} data-topic={sectionFor(p)}>
            <Link href={studioHref(p)}>
              <time dateTime={p.createdAt ?? undefined}>{formatDate(p.createdAt)}</time>
              <span className="s-archive-title">{p.title}</span>
              <span className="s-archive-topic">{sectionFor(p)}</span>
              <span className="s-archive-time">{readingTimeLabel(p)}</span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
