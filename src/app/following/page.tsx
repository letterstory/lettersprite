import type { Metadata } from "next";
import { env } from "@/env";
import { getPosts } from "@/lib/letterbrace/client";
import { allSections, orderedByDate, publishDate, sectionFor, sectionSlug } from "@/lib/editorial";
import { authorsFromPosts, bylineFor } from "@/lib/author";
import { formatDate } from "@/lib/format";
import { coverAltFor, coverImageFor } from "@/lib/covers";
import { FollowingFeed, type FeedPost } from "@/components/FollowingFeed";

// Fully static: the page ships the full catalog (sections, writers, stories) and
// the reader's follow list is applied client-side from localStorage.
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Following",
  description: `Build a personal feed from the sections and writers you follow on ${env.siteTitle}.`,
  alternates: { canonical: "/following" },
};

export default async function FollowingPage() {
  const posts = await getPosts();

  const perSection = new Map<string, number>();
  for (const p of posts) {
    const name = sectionFor(p);
    perSection.set(name, (perSection.get(name) ?? 0) + 1);
  }
  const sections = allSections(posts).map((name) => ({
    name,
    slug: sectionSlug(name),
    count: perSection.get(name) ?? 0,
  }));

  const authors = authorsFromPosts(posts).map((a) => ({
    name: a.byline.name,
    slug: a.slug,
    count: a.posts.length,
  }));

  const feedPosts: FeedPost[] = orderedByDate(posts).map((p) => {
    const b = bylineFor(p);
    const sName = sectionFor(p);
    return {
      slug: p.slug,
      title: p.title,
      dek: p.dek ?? "",
      sectionName: sName,
      sectionSlug: sectionSlug(sName),
      authorName: b.name,
      authorSlug: b.slug,
      dateLabel: formatDate(publishDate(p)),
      cover: coverImageFor(p, 400),
      coverAlt: coverAltFor(p),
    };
  });

  return (
    <div className="container-wide px-6 py-12 sm:py-16">
      <FollowingFeed sections={sections} authors={authors} posts={feedPosts} />
    </div>
  );
}
