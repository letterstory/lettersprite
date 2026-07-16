import { env, hasLetterbraceKey } from "@/env";
import { getPosts } from "@/lib/letterbrace/client";
import { blogListingLd } from "@/lib/seo";
import { getActiveTheme } from "@/themes";
import { EmptyState } from "@/components/EmptyState";
import { JsonLd } from "@/components/JsonLd";
import { BroadsheetHome } from "@/components/home/BroadsheetHome";
import { ColumnHome } from "@/components/home/ColumnHome";
import { FeedHome } from "@/components/home/FeedHome";
import { GlossyHome } from "@/components/home/GlossyHome";
import { GridHome } from "@/components/home/GridHome";
import { MosaicHome } from "@/components/home/MosaicHome";
import { CoverHome } from "@/components/home/CoverHome";
import { GalleryHome } from "@/components/home/GalleryHome";
import { DigestHome } from "@/components/home/DigestHome";
import { TimelineHome } from "@/components/home/TimelineHome";
import { BoardHome } from "@/components/home/BoardHome";

// Fully static: prerendered at build from the baked Letterbrace payload.
export const dynamic = "force-static";

function PreviewBanner() {
  return (
    <div className="border-b border-border bg-surface-alt">
      <div className="container-wide px-6 py-2.5 text-center text-xs text-muted">
        <span className="font-semibold text-foreground">Preview mode</span> —
        showing sample stories. Set{" "}
        <code className="font-mono text-[0.9em]">LETTERBRACE_API_KEY</code> to
        publish your collection.
      </div>
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

  const Home = {
    broadsheet: BroadsheetHome,
    feed: FeedHome,
    mosaic: MosaicHome,
    glossy: GlossyHome,
    column: ColumnHome,
    grid: GridHome,
    cover: CoverHome,
    gallery: GalleryHome,
    digest: DigestHome,
    timeline: TimelineHome,
    board: BoardHome,
  }[theme.home];

  return (
    <>
      <JsonLd data={blogListingLd(posts)} />
      {/* The page's single h1 (the layouts use h2/h3 for stories). */}
      <h1 className="sr-only">
        {env.siteTitle}
        {env.siteTagline ? ` — ${env.siteTagline}` : ""}
      </h1>
      {!hasLetterbraceKey && <PreviewBanner />}
      <Home posts={posts} />
    </>
  );
}
