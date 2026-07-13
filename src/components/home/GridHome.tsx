import type { Post } from "@/lib/letterbrace/types";
import { StoryCard } from "@/components/Story";

/**
 * Clean grid front (lifestyle / minimal). A wide featured pair up top, then an
 * even, airy card grid. Calm, gallery-like — lets imagery and whitespace lead.
 */
export function GridHome({ posts }: { posts: Post[] }) {
  const featured = posts.slice(0, 2);
  const rest = posts.slice(2);

  return (
    <div className="container-wide px-6 py-10">
      {featured.length > 0 && (
        <section className="mb-12 grid gap-8 border-b border-border pb-12 md:grid-cols-2">
          {featured.map((post) => (
            <StoryCard
              key={post.id}
              post={post}
              size="lg"
              ratio="4/3"
              excerpt
              headingLevel={2}
            />
          ))}
        </section>
      )}

      <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((post) => (
          <StoryCard key={post.id} post={post} size="md" ratio="4/3" excerpt />
        ))}
      </div>
    </div>
  );
}
