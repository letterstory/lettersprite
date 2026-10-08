import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBrand } from "@/lib/brand";
import { getPostBySlug, getPosts } from "@/lib/letterbrace/client";
import { getLayout, loadArticle } from "@/lib/studio";
import { StudioShell } from "@/components/studio/StudioShell";
import { NotesArticle } from "@/components/studio/layouts/NotesArticle";
import { JournalArticle } from "@/components/studio/layouts/JournalArticle";
import { MagazineArticle } from "@/components/studio/layouts/MagazineArticle";
import { EssayArticle } from "@/components/studio/layouts/EssayArticle";

type Params = { params: Promise<{ slug: string }> };

export const dynamic = "force-static";
export const dynamicParams = false;

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt || undefined,
    // A preview of the live post: never compete with it in search.
    alternates: { canonical: `/posts/${post.slug}` },
    robots: { index: false, follow: true },
  };
}

const ARTICLES = { notes: NotesArticle, journal: JournalArticle, magazine: MagazineArticle, essay: EssayArticle };

export default async function StudioPost({ params }: Params) {
  const { slug } = await params;
  const a = await loadArticle(slug);
  if (!a) notFound();
  const Article = ARTICLES[getLayout()];
  return (
    <StudioShell>
      <Article brand={getBrand()} a={a} />
    </StudioShell>
  );
}
