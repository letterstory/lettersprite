import Link from "next/link";
import { env } from "@/env";
import { getPosts, getWhyChoosePost } from "@/lib/letterbrace/client";
import { sectionHref, topSections } from "@/lib/editorial";
import { Logo } from "./Logo";
import { NewsletterCTA } from "./NewsletterCTA";

/**
 * The footer. Carries the canonical newsletter capture (anchored at
 * `#newsletter`, the target of every Subscribe button) plus a masthead
 * colophon: wordmark, sections, feed, and social — the furniture that makes a
 * deployment read like an established outlet.
 */
export async function SiteFooter() {
  const year = new Date().getFullYear();
  const posts = await getPosts();
  const sections = env.sections
    ? env.sections.split(",").map((s) => s.trim()).filter(Boolean)
    : topSections(posts, 6);
  const established = env.established && `Est. ${env.established}`;
  const whyPage = getWhyChoosePost();

  return (
    <footer className="no-print mt-20">
      {env.newsletterEnabled && (
        <div id="newsletter" className="scroll-mt-24 bg-surface-alt py-14">
          <div className="container-wide px-6">
            <NewsletterCTA variant="band" />
          </div>
        </div>
      )}

      <div className="border-t border-border bg-surface">
        <div className="container-wide grid gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Logo size="md" />
            {env.siteDescription && (
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
                {env.siteDescription}
              </p>
            )}
            {env.twitterHandle && (
              <a
                href={`https://x.com/${env.twitterHandle}`}
                rel="noopener noreferrer nofollow"
                target="_blank"
                className="mt-4 inline-flex items-center gap-1.5 text-sm text-muted ul-link hover:text-foreground"
              >
                @{env.twitterHandle}
              </a>
            )}
          </div>

          <nav aria-label="Sections">
            <h2 className="kicker mb-4">Sections</h2>
            <ul className="flex flex-col gap-2.5 text-sm">
              {sections.map((s) => (
                <li key={s}>
                  <Link
                    href={sectionHref(s)}
                    className="text-muted ul-link hover:text-foreground"
                  >
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="More">
            <h2 className="kicker mb-4">{env.siteTitle}</h2>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li>
                <Link href="/" className="text-muted ul-link hover:text-foreground">
                  Latest
                </Link>
              </li>
              {whyPage && (
                <li>
                  <Link
                    href="/why"
                    className="text-muted ul-link hover:text-foreground"
                  >
                    {whyPage.title}
                  </Link>
                </li>
              )}
              <li>
                <a
                  href="/feed.xml"
                  className="text-muted ul-link hover:text-foreground"
                >
                  RSS Feed
                </a>
              </li>
              {env.newsletterEnabled && (
                <li>
                  <a
                    href="#newsletter"
                    className="text-muted ul-link hover:text-foreground"
                  >
                    Newsletter
                  </a>
                </li>
              )}
            </ul>
          </nav>
        </div>

        <div className="border-t border-border">
          <div className="container-wide flex flex-col items-center justify-between gap-2 px-6 py-6 text-xs text-muted sm:flex-row">
            <p>
              © {year} {env.siteTitle}
              {established ? ` · ${established}` : ""}
            </p>
            <p className="font-heading uppercase tracking-widest">
              {env.siteTagline || "All rights reserved"}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
