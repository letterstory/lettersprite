import Link from "@/components/Link";
import { authorHref, authorProfile, type Byline } from "@/lib/author";

/**
 * The contributor card at the foot of an article: avatar, name, and a link to
 * the author's `/authors/[slug]` page, plus the bank's bio when the author has
 * one. By default they don't, so the card is just the name — nothing is invented.
 * A byline with no profile (a `site_byline` post) has no card.
 */
export function AuthorCard({
  byline,
  storyCount = 1,
  className = "",
}: {
  byline: Byline;
  storyCount?: number;
  className?: string;
}) {
  const href = authorHref(byline);
  if (!href) return null;
  const { bio } = authorProfile(byline);
  const more =
    storyCount > 1 ? `View all ${storyCount} stories` : "View all stories";

  return (
    <aside
      className={`flex flex-col gap-4 rounded-[var(--radius)] border border-border bg-surface p-6 sm:flex-row sm:items-start sm:gap-5 ${className}`}
    >
      <Link href={href} tabIndex={-1} aria-hidden className="shrink-0">
        <span
          className="avatar h-14 w-14 text-lg"
          style={{ backgroundColor: byline.color }}
        >
          {byline.initials}
        </span>
      </Link>
      <div className="flex flex-col gap-1.5">
        <p className="kicker kicker-muted">Written by</p>
        <h2 className="font-heading text-lg font-bold leading-tight">
          <Link href={href} className="headline-link">
            {byline.name}
          </Link>
        </h2>
        {bio && <p className="text-sm leading-relaxed text-fg-soft">{bio}</p>}
        <Link
          href={href}
          className="mt-1 w-fit font-heading text-sm font-semibold text-link ul-link"
        >
          {more} →
        </Link>
      </div>
    </aside>
  );
}
