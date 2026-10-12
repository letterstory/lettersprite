import type { DisclosureSurface, SponsorDisclosure } from "@/lib/letterbrace/types";

/**
 * Sponsor disclosure, read side. Every renderer asks one question — "is this
 * surface listed?" — and renders Letterstory's words if so. Nothing here
 * decides whether a publication is sponsored or how to say it.
 */

/** Is `surface` one this post's disclosure is shown on? */
export function discloses(
  disclosure: SponsorDisclosure | null | undefined,
  surface: DisclosureSurface,
): disclosure is SponsorDisclosure {
  return Boolean(disclosure?.surfaces.includes(surface));
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
