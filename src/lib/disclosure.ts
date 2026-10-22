import type { DisclosureSurface, Post, SponsorDisclosure } from "@/lib/letterbrace/types";

/**
 * Sponsor disclosure, read side. Every renderer asks one question — "is this
 * surface listed?" — and renders Letter's words if so. Nothing here
 * decides whether a publication is sponsored or how to say it.
 */

/** Is `surface` one this post's disclosure is shown on? */
export function discloses(
  disclosure: SponsorDisclosure | null | undefined,
  surface: DisclosureSurface,
): disclosure is SponsorDisclosure {
  return Boolean(disclosure?.surfaces.includes(surface));
}

/**
 * The line at the top of the article, by the byline, when the disclosure lists
 * `article_header`: `label`, verbatim ("Sponsored by Acme"). Null when there
 * is nothing to set.
 */
export function headerLine(disclosure: SponsorDisclosure | null | undefined): string | null {
  return discloses(disclosure, "article_header") ? disclosure.label : null;
}

/** Is the post's byline the site's own, never a person's (`site_byline`)? */
export function siteByline(disclosure: SponsorDisclosure | null | undefined): boolean {
  return discloses(disclosure, "site_byline");
}

/**
 * `lead` set in front of `text` as its own sentence: "Sponsored by Acme. …".
 * A lead that already ends a sentence ("… Acme Inc.") gets no second stop;
 * with no `text`, the lead stands alone.
 */
export function prefixed(lead: string, text: string | null | undefined): string {
  const head = /[.!?]$/.test(lead) ? lead : `${lead}.`;
  const rest = text?.trim();
  return rest ? `${head} ${rest}` : head;
}

/**
 * A post's meta / Open Graph / Twitter description, prefixed with `label` when
 * its disclosure lists `meta_description`, so a search result or a link
 * preview carries the disclosure. The title is never touched.
 */
export function disclosedDescription(
  disclosure: SponsorDisclosure | null | undefined,
  description: string | null | undefined,
): string | undefined {
  if (discloses(disclosure, "meta_description")) return prefixed(disclosure.label, description);
  return description || undefined;
}

/**
 * The site's own disclosure. The blog has no site-level API, so it is read off
 * the posts: the disclosure of the most recently published post that lists
 * `site_statement` (an undated post ranks after every dated one). Null when no
 * post does. Pass it the build's `getPosts()`, so every page agrees.
 */
export function siteDisclosure(posts: Post[]): SponsorDisclosure | null {
  let best: Post | null = null;
  for (const post of posts) {
    if (!discloses(post.sponsorDisclosure, "site_statement")) continue;
    if (!best || (post.createdAt ?? "") > (best.createdAt ?? "")) best = post;
  }
  return best?.sponsorDisclosure ?? null;
}

/**
 * The site-wide statement, verbatim: `siteText`. Empty when the disclosure
 * does not list `site_statement`.
 */
export function siteStatement(disclosure: SponsorDisclosure | null | undefined): string {
  return discloses(disclosure, "site_statement") ? disclosure.siteText : "";
}

/** A hostname without a leading `www.`, lower-cased, so `www.acme.com` and `acme.com` compare equal. */
function bareHost(hostname: string): string {
  return hostname.toLowerCase().replace(/^www\./, "");
}

/**
 * The host whose links are marked sponsored: the sponsor URL's hostname,
 * minus `www.`. Null when `sponsored_links` is off or the sponsor has no URL —
 * with nothing to compare against, no link is marked.
 */
export function sponsoredHost(disclosure: SponsorDisclosure | null | undefined): string | null {
  if (!discloses(disclosure, "sponsored_links") || !disclosure.sponsor.url) return null;
  try {
    return bareHost(new URL(disclosure.sponsor.url).hostname) || null;
  } catch {
    return null;
  }
}

/**
 * Does `href` point at `host` or a subdomain of it? http(s) links only; a
 * relative link is to this site, never the sponsor's. `notacme.com`
 * is not a subdomain of `acme.com`.
 */
export function isSponsorHref(href: string | undefined, host: string): boolean {
  if (!href) return false;
  try {
    // `.invalid` can never be a sponsor's host, so a relative href resolves to
    // a non-match while `//acme.com/…` still resolves to acme.com.
    const u = new URL(href.trim(), "https://relative.invalid/");
    if (u.protocol !== "http:" && u.protocol !== "https:") return false;
    const h = bareHost(u.hostname);
    return h === host || h.endsWith(`.${host}`);
  } catch {
    return false;
  }
}

/** `rel` with `token` added once, every existing token kept in order. */
export function addRelToken(rel: string | undefined, token: string): string {
  const tokens = (rel ?? "").split(/\s+/).filter(Boolean);
  if (!tokens.some((t) => t.toLowerCase() === token)) tokens.push(token);
  return tokens.join(" ");
}
