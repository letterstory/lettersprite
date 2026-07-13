import type { Post } from "@/lib/letterbrace/types";
import { StoryCard } from "./Story";

/**
 * "More in <section>" / suggested reading at the foot of an article. Powered by
 * the deterministic `relatedPosts` selection so every article recommends a
 * stable, section-aware set of further reading.
 */
export function RelatedPosts({
  posts,
  label = "More Stories",
}: {
  posts: Post[];
  label?: string;
}) {
  if (posts.length === 0) return null;
  return (
    <section className="no-print mt-16 border-t-2 border-foreground pt-8">
      <h2 className="rule-label mb-8">{label}</h2>
      <div className="grid gap-8 sm:grid-cols-3">
        {posts.map((post) => (
          <StoryCard
            key={post.id}
            post={post}
            size="sm"
            ratio="16/9"
            excerpt={false}
          />
        ))}
      </div>
    </section>
  );
}
