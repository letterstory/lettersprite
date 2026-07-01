import { env, hasLetterbraceKey } from "@/env";
import { getPosts } from "@/lib/letterbrace/client";
import { getActiveTheme } from "@/themes";
import { EmptyState } from "@/components/EmptyState";
import { PostCard } from "@/components/PostCard";
import { PostListItem } from "@/components/PostListItem";

// Fully static: prerendered at build from the baked Letterbrace payload.
export const dynamic = "force-static";

function PreviewBanner() {
  return (
    <div className="mb-10 rounded-[var(--radius)] border border-border bg-surface px-4 py-3 text-sm text-muted">
      <span className="font-semibold text-foreground">Preview mode.</span>{" "}
      Showing sample posts — set{" "}
      <code className="font-mono text-[0.85em]">LETTERBRACE_API_KEY</code> to
      publish your own Letterbrace collection.
    </div>
  );
}

export default async function HomePage() {
  const theme = getActiveTheme();
  const posts = await getPosts();

  if (posts.length === 0) {
    return (
      <div className="container-content px-6 py-24">
        <EmptyState />
      </div>
    );
  }

  const container =
    theme.layout === "list" ? "container-content" : "container-wide";
  const [featured, ...rest] = posts;

  return (
    <div className={`${container} px-6 py-12`}>
      {!hasLetterbraceKey && <PreviewBanner />}

      {theme.layout === "list" && (
        <>
          {env.siteDescription && (
            <p className="mb-10 text-lg text-muted">{env.siteDescription}</p>
          )}
          {posts.map((post) => (
            <PostListItem key={post.id} post={post} />
          ))}
        </>
      )}

      {theme.layout === "grid" && (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {theme.layout === "magazine" && (
        <div className="flex flex-col gap-10">
          <PostCard post={featured} featured />
          {rest.length > 0 && (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
