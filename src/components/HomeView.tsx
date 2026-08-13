import { env, hasLetterbraceKey } from "@/env";
import { blogListingLd } from "@/lib/seo";
import { getActiveTheme } from "@/themes";
import type { Post } from "@/lib/letterbrace/types";
import { JsonLd } from "@/components/JsonLd";
import { Pagination } from "@/components/Pagination";
import { homeLayoutFor } from "@/components/home";

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

/**
 * The home listing for one page of posts — shared by `/` (page 1) and the
 * `/page/N` routes so both render identically. Picks the active theme's front
 * layout, renders the page's slice through it, and appends the numbered pager
 * when there's more than one page.
 */
export function HomeView({
  items,
  page,
  totalPages,
}: {
  items: Post[];
  page: number;
  totalPages: number;
}) {
  const theme = getActiveTheme();
  const Home = homeLayoutFor(theme.home);

  return (
    <>
      <JsonLd data={blogListingLd(items)} />
      {/* The page's single h1 (the layouts use h2/h3 for stories). */}
      <h1 className="sr-only">
        {env.siteTitle}
        {env.siteTagline ? ` — ${env.siteTagline}` : ""}
        {page > 1 ? ` — Page ${page}` : ""}
      </h1>
      {!hasLetterbraceKey && <PreviewBanner />}
      <Home posts={items} />
      {totalPages > 1 && (
        <div className="container-wide px-6 pb-16">
          <Pagination page={page} totalPages={totalPages} />
        </div>
      )}
    </>
  );
}
