import type { Post } from "@/lib/letterbrace/types";
import { editorsPicks } from "@/lib/related";
import { HeadlineItem, LeadStory, StoryRow } from "@/components/Story";
import { NewsletterCTA } from "@/components/NewsletterCTA";

/**
 * Feed front (TechCrunch / Axios). A hero lead, then a fast river of thumbnail
 * rows in the main column with a sticky rail of "Popular" picks and a newsletter
 * card alongside — an always-updating newsroom feel.
 */
export function FeedHome({ posts }: { posts: Post[] }) {
  const [lead, ...river] = posts;
  const picks = editorsPicks(posts, lead ? [lead] : [], 5);

  return (
    <div className="container-wide px-6 py-8">
      {lead && (
        <section className="mb-8 border-b border-border pb-8">
          <LeadStory post={lead} ratio="16/9" />
        </section>
      )}

      <div className="grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="rule-label mb-6">The Latest</h2>
          <div className="flex flex-col divide-y divide-border">
            {river.map((post) => (
              <div key={post.id} className="py-6 first:pt-0">
                <StoryRow post={post} dek />
              </div>
            ))}
          </div>
        </div>

        <aside className="flex flex-col gap-8 lg:sticky lg:top-24 lg:self-start">
          <div>
            <h2 className="rule-label mb-5">Popular</h2>
            <ol className="flex flex-col divide-y divide-border">
              {picks.map((post, i) => (
                <li key={post.id} className="flex gap-4 py-4 first:pt-0">
                  <span className="font-display text-2xl font-black leading-none text-primary/40">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <HeadlineItem post={post} kicker={false} />
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <NewsletterCTA variant="inline" />
        </aside>
      </div>
    </div>
  );
}
