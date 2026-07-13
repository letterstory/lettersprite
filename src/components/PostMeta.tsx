import Link from "next/link";
import { formatDate } from "@/lib/format";
import { bylineFor } from "@/lib/author";
import {
  isUpdated,
  modifiedDate,
  publishDate,
  readingTimeLabel,
} from "@/lib/editorial";
import type { Post } from "@/lib/letterbrace/types";

/**
 * The byline row shared across cards, rows and the article header. Every post
 * gets a real author, a dateline and a reading time — the small print that
 * makes a page read like a working publication rather than a template.
 *
 * `variant`:
 *  - "inline"  — a compact "Author · Date · 5 min read" line (cards, rows).
 *  - "byline"  — an avatar chip beside the author name/role and dateline
 *                (article headers, feature cards).
 */
export function PostMeta({
  post,
  className = "",
  variant = "inline",
  readingTime = false,
  showAvatar = false,
  linkAuthor = false,
  showUpdated = false,
}: {
  post: Post;
  className?: string;
  variant?: "inline" | "byline";
  readingTime?: boolean;
  showAvatar?: boolean;
  /** Link the byline name to the author's `/authors/[slug]` page. */
  linkAuthor?: boolean;
  /** Append an "Updated {date}" stamp when the post has a real later revision. */
  showUpdated?: boolean;
}) {
  const byline = bylineFor(post);
  const iso = publishDate(post);
  const date = formatDate(iso);
  const read = readingTimeLabel(post);
  const updated = showUpdated && isUpdated(post);
  const updatedIso = updated ? modifiedDate(post) : "";

  const name = linkAuthor ? (
    <Link href={`/authors/${byline.slug}`} className="ul-link hover:text-foreground">
      {byline.name}
    </Link>
  ) : (
    byline.name
  );

  if (variant === "byline") {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <span
          className="avatar h-9 w-9 text-[0.8rem]"
          style={{ backgroundColor: byline.color }}
          aria-hidden
        >
          {byline.initials}
        </span>
        <div className="leading-tight">
          <div className="font-heading text-sm font-semibold text-foreground">
            {name}
          </div>
          <div className="text-xs text-muted">
            {byline.role}
            {" · "}
            <time dateTime={iso}>{date}</time>
            {readingTime && <> · {read}</>}
            {updated && (
              <>
                {" · "}
                <span>Updated <time dateTime={updatedIso}>{formatDate(updatedIso)}</time></span>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-muted ${className}`}
    >
      {showAvatar && (
        <span
          className="avatar h-5 w-5 text-[0.6rem]"
          style={{ backgroundColor: byline.color }}
          aria-hidden
        >
          {byline.initials}
        </span>
      )}
      <span className="font-medium text-foreground">{name}</span>
      <span aria-hidden>·</span>
      <time dateTime={iso}>{date}</time>
      {readingTime && (
        <>
          <span aria-hidden>·</span>
          <span>{read}</span>
        </>
      )}
    </div>
  );
}
