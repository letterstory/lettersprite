import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPosts } from "@/lib/letterbrace/client";
import { HomeView } from "@/components/HomeView";
import { pageCount, pageSlice } from "@/lib/pagination";

// Fully static: every page is baked at build; unknown page numbers 404.
export const dynamic = "force-static";
export const dynamicParams = false;

type Params = { params: Promise<{ n: string }> };

/** Parse a `/page/N` segment to a valid page number ≥ 2, else null. */
function parsePage(n: string): number | null {
  if (!/^\d+$/.test(n)) return null;
  const p = Number(n);
  return Number.isInteger(p) && p >= 2 ? p : null;
}

export async function generateStaticParams() {
  const posts = await getPosts();
  const total = pageCount(posts.length);
  // Page 1 lives at `/`, so only 2..total get their own route.
  return Array.from({ length: Math.max(0, total - 1) }, (_, i) => ({
    n: String(i + 2),
  }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { n } = await params;
  const page = parsePage(n);
  if (!page) return {};
  return {
    title: `Page ${page}`,
    alternates: { canonical: `/page/${page}` },
  };
}

export default async function PagedHomePage({ params }: Params) {
  const { n } = await params;
  const page = parsePage(n);
  const posts = await getPosts();
  const total = pageCount(posts.length);
  if (!page || page > total) notFound();

  return (
    <HomeView items={pageSlice(posts, page)} page={page} totalPages={total} />
  );
}
