import Link from "next/link";
import type { Post } from "@/lib/letterbrace/types";
import { coverImageFor } from "@/lib/covers";
import { PostMeta } from "./PostMeta";

/** Row used by the single-column list layout. */
export function PostListItem({ post }: { post: Post }) {
  const href = `/posts/${post.slug}`;
  const cover = coverImageFor(post);
  return (
    <article className="group border-b border-border py-9">
      <Link
        href={href}
        className="mb-5 block overflow-hidden rounded-[var(--radius)]"
      >
        <img
          src={cover}
          alt=""
          className="h-52 w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </Link>
      {post.tags[0] && (
        <span className="text-[0.7rem] font-semibold uppercase tracking-widest text-primary">
          {post.tags[0]}
        </span>
      )}
      <h2 className="mt-2 font-heading text-2xl font-bold leading-snug tracking-tight">
        <Link href={href} className="transition-colors hover:text-primary">
          {post.title}
        </Link>
      </h2>
      <PostMeta post={post} className="mt-2 text-sm" />
      <p className="mt-3 leading-relaxed text-muted">{post.excerpt}</p>
      <Link
        href={href}
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary"
      >
        Read more
        <span className="transition-transform duration-200 group-hover:translate-x-0.5">
          →
        </span>
      </Link>
    </article>
  );
}
