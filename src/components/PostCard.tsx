import Link from "next/link";
import type { Post } from "@/lib/letterbrace/types";
import { PostMeta } from "./PostMeta";

/** Card used by the grid and magazine layouts. `featured` renders larger. */
export function PostCard({
  post,
  featured = false,
}: {
  post: Post;
  featured?: boolean;
}) {
  const href = `/posts/${post.slug}`;
  return (
    <article
      className={`group flex flex-col overflow-hidden rounded-[var(--radius)] border border-border bg-surface transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/5 ${
        featured ? "sm:flex-row" : ""
      }`}
    >
      {post.coverImage && (
        <Link
          href={href}
          className={`block overflow-hidden ${featured ? "sm:w-1/2" : ""}`}
        >
          <img
            src={post.coverImage}
            alt=""
            className={`w-full object-cover transition-transform duration-300 group-hover:scale-105 ${
              featured ? "h-64 sm:h-full" : "h-48"
            }`}
          />
        </Link>
      )}
      <div className="flex flex-1 flex-col gap-3 p-6">
        {post.tags[0] && (
          <span className="text-[0.7rem] font-semibold uppercase tracking-widest text-primary">
            {post.tags[0]}
          </span>
        )}
        <h2
          className={`font-heading font-bold leading-tight tracking-tight ${
            featured ? "text-3xl" : "text-xl"
          }`}
        >
          <Link href={href} className="transition-colors hover:text-primary">
            {post.title}
          </Link>
        </h2>
        {post.excerpt && (
          <p className="line-clamp-3 flex-1 text-muted">{post.excerpt}</p>
        )}
        <PostMeta post={post} className="text-xs" />
      </div>
    </article>
  );
}
