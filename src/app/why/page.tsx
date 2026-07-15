import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { env } from "@/env";
import { getPosts, getWhyChoosePost } from "@/lib/letterbrace/client";
import { allSections, isLongread, publishDate, sectionSlug } from "@/lib/editorial";
import { sanitizePostHtml } from "@/lib/sanitize";
import { faqLd, newsArticleLd, pageBreadcrumbLd } from "@/lib/seo";
import { whyPageUrl } from "@/lib/url";
import { coverImageFor } from "@/lib/covers";
import { getActiveTheme } from "@/themes";
import { BackToTop } from "@/components/BackToTop";
import { JsonLd } from "@/components/JsonLd";
import { NewsletterCTA } from "@/components/NewsletterCTA";
import { PostContent } from "@/components/PostContent";
import { PostMeta } from "@/components/PostMeta";
import { ReadingProgress } from "@/components/ReadingProgress";
import { ShareRow } from "@/components/ShareRow";
import { TopicTags } from "@/components/TopicTags";

// Fully static, like every other route. When the payload carries no `whyChoose`
// content the page 404s (a baked static 404) rather than rendering empty.
export const dynamic = "force-static";

export function generateMetadata(): Metadata {
  const post = getWhyChoosePost();
  if (!post) return {};

  const description = post.excerpt || undefined;
  const url = whyPageUrl();
  const image = {
    url: coverImageFor(post),
    width: 1200,
    height: 675,
    alt: post.title,
  };
  return {
    title: post.title,
    description,
    alternates: { canonical: "/why" },
    openGraph: {
      type: "article",
      title: post.title,
      description,
      url,
      siteName: env.siteTitle,
      locale: "en_US",
      publishedTime: publishDate(post),
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: [image.url],
      site: env.twitterHandle ? `@${env.twitterHandle}` : undefined,
    },
  };
}

export default async function WhyPage() {
  const post = getWhyChoosePost();
  if (!post) notFound();

  const theme = getActiveTheme();
  const feature = theme.article === "feature";
  const dropCap = Boolean(theme.features?.dropCap);

  const bodyHtml = sanitizePostHtml(post.content);
  const url = whyPageUrl();
  const faq = faqLd(post, url);

  // Topic chips link out only to section pages that actually exist; the byline
  // and section kicker stay unlinked because a payload-authored `whyChoose`
  // post isn't in getPosts(), so it has no /authors or /sections page of its own.
  const linkableSlugs = allSections(await getPosts()).map((s) => sectionSlug(s));

  return (
    <>
      <JsonLd data={newsArticleLd(post, url)} />
      <JsonLd data={pageBreadcrumbLd(post.title)} />
      {faq && <JsonLd data={faq} />}

      <ReadingProgress />
      <BackToTop />

      <article id="top" className="px-6 py-10">
        <header className="container-content">
          <nav
            aria-label="Breadcrumb"
            className="no-print mb-6 flex items-center gap-2 text-xs text-muted"
          >
            <Link href="/" className="ul-link hover:text-foreground">
              Home
            </Link>
            <span aria-hidden>/</span>
            <span className="text-foreground">{post.title}</span>
          </nav>

          <div className="mb-3 flex flex-wrap items-center gap-3">
            <span className="kicker">The Case</span>
            {isLongread(post) && <span className="pill">Long read</span>}
          </div>
          <h1
            className={`${feature ? "display" : "font-display"} text-3xl font-black leading-[1.08] tracking-tight text-balance sm:text-4xl md:text-5xl`}
          >
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="dek mt-5 text-xl leading-relaxed text-fg-soft text-pretty">
              {post.excerpt}
            </p>
          )}

          <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-y border-border py-4">
            <PostMeta post={post} variant="byline" readingTime showUpdated />
            <ShareRow url={url} title={post.title} />
          </div>
        </header>

        {post.coverImage && (
          <figure
            className={`mx-auto mt-8 ${feature ? "container-wide" : "container-content"}`}
          >
            <img
              src={post.coverImage}
              alt=""
              className="w-full rounded-[var(--radius)] object-cover"
            />
          </figure>
        )}

        <div className="container-content mt-10">
          <PostContent html={bodyHtml} sanitized dropCap={dropCap} />

          <div className="fin" aria-hidden />

          <TopicTags
            tags={post.tags}
            linkableSlugs={linkableSlugs}
            className="mt-10"
          />

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
            <ShareRow url={url} title={post.title} withLabel />
            <a
              href="#top"
              className="no-print kicker kicker-muted ul-link hover:text-primary"
            >
              Return to top ↑
            </a>
          </div>

          {env.newsletterEnabled && (
            <NewsletterCTA variant="inline" className="mt-12 no-print" />
          )}
        </div>
      </article>
    </>
  );
}
