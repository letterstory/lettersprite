/**
 * Mozilla Readability's class/id patterns, copied verbatim from 0.6
 * (`REGEXPS.unlikelyCandidates` and `negative`). Reader modes and most AI page
 * extractors are built on it, and it deletes any element whose class matches
 * either — "sponsor" included. Shared by the tests that pin every disclosure
 * element's classes against them; nothing renders from here.
 */
export const UNLIKELY =
  /-ad-|ai2html|banner|breadcrumbs|combx|comment|community|cover-wrap|disqus|extra|footer|gdpr|header|legends|menu|related|remark|replies|rss|shoutbox|sidebar|skyscraper|social|sponsor|supplemental|ad-break|agegate|pagination|pager|popup|yom-remote/i;
export const NEGATIVE =
  /-ad-|hidden|^hid$| hid$| hid |^hid |banner|combx|comment|com-|contact|footer|gdpr|masthead|media|meta|outbrain|promo|related|scroll|share|shoutbox|sidebar|skyscraper|sponsor|shopping|tags|widget/i;
/** Readability lifts an element classed like this out of the article as its byline. */
export const BYLINE = /byline|author|dateline|writtenby|p-author/i;

/** Every class in `html`'s `class="…"` attributes. */
export function classesOf(html: string): string[] {
  return [...html.matchAll(/class="([^"]*)"/g)].flatMap((m) => m[1].split(/\s+/)).filter(Boolean);
}

/** The classes of `html` that Readability would strip, or lift out as a byline. */
export function strippedClasses(html: string): string[] {
  return classesOf(html).filter((c) => UNLIKELY.test(c) || NEGATIVE.test(c) || BYLINE.test(c));
}
