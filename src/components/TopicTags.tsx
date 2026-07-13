import Link from "next/link";
import { sectionHref, sectionSlug } from "@/lib/editorial";

/**
 * "Filed under" topic chips at the foot of an article. A tag links to its
 * `/sections/[slug]` index only when that section page actually exists
 * (`linkableSlugs`) — otherwise it renders as a static chip, so we never emit a
 * link to a section route that `dynamicParams = false` would 404.
 */
export function TopicTags({
  tags,
  linkableSlugs,
  className = "",
}: {
  tags: string[];
  linkableSlugs: string[];
  className?: string;
}) {
  const unique = [...new Set(tags.map((t) => t.trim()).filter(Boolean))].slice(0, 6);
  if (unique.length === 0) return null;
  const linkable = new Set(linkableSlugs);

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span className="kicker kicker-muted mr-1">Filed under</span>
      {unique.map((tag) =>
        linkable.has(sectionSlug(tag)) ? (
          <Link
            key={tag}
            href={sectionHref(tag)}
            className="pill transition-opacity hover:opacity-80"
          >
            {tag}
          </Link>
        ) : (
          <span key={tag} className="pill">
            {tag}
          </span>
        ),
      )}
    </div>
  );
}
