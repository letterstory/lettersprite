import type { Post } from "@/lib/letterbrace/types";
import {
  HeadlineItem,
  HeadlineList,
  LeadStory,
  StoryCard,
} from "@/components/Story";

/**
 * Broadsheet front (The New York Times). A dominant lead beside a ruled rail of
 * secondary headlines, then a three-column river divided by hairlines — the
 * page reads top-to-bottom like columns of newsprint. Structure comes from type
 * and rules, not cards or shadows.
 */
export function BroadsheetHome({ posts }: { posts: Post[] }) {
  const [lead, ...rest] = posts;
  const rail = rest.slice(0, 4);
  const river = rest.slice(4);

  // Split the river into three newspaper columns, round-robin for balance.
  const cols: Post[][] = [[], [], []];
  river.forEach((p, i) => cols[i % 3].push(p));

  return (
    <div className="container-wide px-6 py-8">
      <section className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8 lg:border-r lg:border-border lg:pr-8">
          {lead && <LeadStory post={lead} ratio="16/9" />}
        </div>
        <aside className="lg:col-span-4">
          <h2 className="rule-label mb-5">Latest</h2>
          <HeadlineList posts={rail} kicker excerpt={false} />
        </aside>
      </section>

      {river.length > 0 && (
        <>
          <div className="my-9 border-t-2 border-foreground" />
          <div className="grid gap-8 md:grid-cols-3">
            {cols.map((col, i) => (
              <div
                key={i}
                className={
                  i > 0 ? "md:border-l md:border-border md:pl-8" : undefined
                }
              >
                <div className="flex flex-col divide-y divide-border">
                  {col.map((post, j) => (
                    <div key={post.id} className="py-6 first:pt-0 last:pb-0">
                      {/* Lead each column with a small image, then text-only. */}
                      {j === 0 ? (
                        <StoryCard
                          post={post}
                          size="sm"
                          ratio="16/9"
                          excerpt
                        />
                      ) : (
                        <HeadlineItem post={post} excerpt />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
