import Link from "@/components/Link";
import type { Post } from "@/lib/letterbrace/types";
import type { Brand } from "@/lib/brand";
import { bylineFor } from "@/lib/author";
import { readingTimeLabel, sectionFor } from "@/lib/editorial";
import { formatDate } from "@/lib/format";
import { StudioCover } from "./StudioCover";

export function studioHref(post: Post): string {
  return `/new/posts/${post.slug}`;
}

/** One story in a grid: cover, kicker, title, dek, byline. */
export function StoryCard({
  post,
  brand,
  size = "md",
}: {
  post: Post;
  brand: Brand;
  size?: "lg" | "md" | "sm";
}) {
  const byline = bylineFor(post);
  return (
    <article className={`s-card s-card-${size}`}>
      <Link href={studioHref(post)} className="s-card-link">
        <div className="s-card-media">
          <StudioCover post={post} brand={brand} />
        </div>
        <div className="s-card-body">
          <p className="s-kicker">{sectionFor(post)}</p>
          <h3 className="s-card-title">{post.title}</h3>
          {size !== "sm" && post.dek && <p className="s-card-dek">{post.dek}</p>}
          <p className="s-meta">
            <span>{byline.name}</span>
            <span aria-hidden>·</span>
            <span>{formatDate(post.createdAt)}</span>
            <span aria-hidden>·</span>
            <span>{readingTimeLabel(post)}</span>
          </p>
        </div>
      </Link>
    </article>
  );
}
