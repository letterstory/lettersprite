import { getPosts } from "@/lib/letterbrace/client";
import { EmptyState } from "@/components/EmptyState";
import { HomeView } from "@/components/HomeView";
import { pageCount, pageSlice } from "@/lib/pagination";

// Fully static: prerendered at build from the baked Letterbrace payload.
export const dynamic = "force-static";

export default async function HomePage() {
  const posts = await getPosts();

  if (posts.length === 0) {
    return (
      <div className="container-content px-6 py-24">
        <EmptyState />
      </div>
    );
  }

  // Page 1 lives here at `/`; pages 2+ are the static `/page/N` routes.
  return (
    <HomeView items={pageSlice(posts, 1)} page={1} totalPages={pageCount(posts.length)} />
  );
}
