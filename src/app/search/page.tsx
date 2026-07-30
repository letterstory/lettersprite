import { Suspense } from "react";
import type { Metadata } from "next";
import { getPosts } from "@/lib/letterbrace/client";
import { sectionFor } from "@/lib/editorial";
import { SearchResults, type SearchItem } from "@/components/SearchResults";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Search",
  // A query-driven utility page — keep it out of the index.
  robots: { index: false },
};

export default async function SearchPage() {
  const posts = await getPosts();
  const index: SearchItem[] = posts.map((p) => ({
    slug: p.slug,
    title: p.title,
    section: sectionFor(p),
    excerpt: p.excerpt,
    tags: p.tags,
  }));
  return (
    <Suspense>
      <SearchResults index={index} />
    </Suspense>
  );
}
