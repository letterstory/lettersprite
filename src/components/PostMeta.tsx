import { formatDate } from "@/lib/format";
import type { Post } from "@/lib/letterbrace/types";

/** Author · date byline shared across cards, rows and the post header. */
export function PostMeta({
  post,
  className = "",
}: {
  post: Post;
  className?: string;
}) {
  if (!post.author && !post.createdAt) return null;
  return (
    <div className={`flex items-center gap-2 text-muted ${className}`}>
      {post.author && <span>{post.author}</span>}
      {post.author && post.createdAt && <span aria-hidden>·</span>}
      {post.createdAt && (
        <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
      )}
    </div>
  );
}
