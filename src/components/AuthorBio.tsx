import Link from "next/link";
import { authorProfile, type Byline } from "@/lib/author";

/**
 * The contributor card at the foot of an article: avatar, name, role, a
 * deterministic bio, and a link to the author's `/authors/[slug]` page. The bio
 * furniture is synthesized deterministically (see `authorProfile`) in the same
 * spirit as the rest of the generated editorial metadata — stable across builds,
 * and coverage-focused (never inventing a personal history for a real byline).
 */
export function AuthorBio({
  byline,
  beats,
  storyCount = 1,
  className = "",
}: {
  byline: Byline;
  beats: string[];
  storyCount?: number;
  className?: string;
}) {
  const { bio } = authorProfile(byline, beats);
  const href = `/authors/${byline.slug}`;
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
        <p className="text-sm leading-relaxed text-fg-soft">{bio}</p>
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
