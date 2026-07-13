import Link from "next/link";
import { sectionFor } from "@/lib/editorial";
import type { Post } from "@/lib/letterbrace/types";

/**
 * Previous / next story navigation at the foot of an article, ordered by
 * (deterministic) publish date — the "keep reading" furniture of a real
 * publication. `next` is the newer story, `prev` the older one.
 */
function NavCard({ post, dir }: { post: Post; dir: "prev" | "next" }) {
  const next = dir === "next";
  return (
    <Link
      href={`/posts/${post.slug}`}
      className={`group flex flex-col gap-1.5 rounded-[var(--radius)] border border-border p-5 transition-colors hover:border-primary ${
        next ? "sm:items-end sm:text-right" : ""
      }`}
    >
      <span className="kicker kicker-muted">{next ? "Next story" : "Previous story"}</span>
      <span className="font-heading font-bold leading-snug line-clamp-2 transition-colors group-hover:text-link">
        {post.title}
      </span>
      <span className="text-xs text-muted">{sectionFor(post)}</span>
    </Link>
  );
}

export function PostNav({
  prev,
  next,
  className = "",
}: {
  prev: Post | null;
  next: Post | null;
  className?: string;
}) {
  if (!prev && !next) return null;
  return (
    <nav
      aria-label="More stories"
      className={`grid gap-4 sm:grid-cols-2 ${className}`}
    >
      {prev ? <NavCard post={prev} dir="prev" /> : <span className="hidden sm:block" />}
      {next && <NavCard post={next} dir="next" />}
    </nav>
  );
}
