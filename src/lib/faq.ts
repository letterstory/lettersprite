/**
 * Build-time FAQ extraction, for AEO (answer-engine) `FAQPage` structured data.
 *
 * Given an article's HTML, pair every section heading phrased as a question
 * (its text ends with "?") with the prose that follows it, up to the next
 * heading. Everything is derived purely from the visible content, so the FAQ
 * structured data always matches what a reader actually sees — a requirement
 * for FAQ rich results — and it stays deterministic across builds. No DOM, no
 * client JS: this runs once at build time.
 */

import { stripHtml } from "./letterbrace/normalize";

export interface Faq {
  question: string;
  answer: string;
}

/** Any heading level can pose a question; h1 is the title, so start at h2. */
const HEADING = /<(h[2-6])\b[^>]*>([\s\S]*?)<\/\1>/gi;

/** Google rejects FAQ answers past a few thousand chars; keep them tight. */
const MAX_ANSWER = 1200;

/**
 * Extract question/answer pairs from article HTML. Returns [] when the piece
 * has no question-shaped headings (the common case), so callers can skip
 * emitting a `FAQPage` entirely.
 */
export function extractFaqs(html: string, max = 10): Faq[] {
  if (!html) return [];

  // A literal heading inside a <pre>/<code> sample is not a section heading.
  const skip: Array<[number, number]> = [];
  for (const m of html.matchAll(/<(pre|code)\b[^>]*>[\s\S]*?<\/\1>/gi)) {
    if (m.index !== undefined) skip.push([m.index, m.index + m[0].length]);
  }
  const insideSkip = (i: number) => skip.some(([a, b]) => i >= a && i < b);

  // Every real heading, with the byte span it occupies.
  const heads: Array<{ start: number; end: number; text: string }> = [];
  for (const m of html.matchAll(HEADING)) {
    if (m.index === undefined || insideSkip(m.index)) continue;
    heads.push({
      start: m.index,
      end: m.index + m[0].length,
      text: stripHtml(m[2]).trim(),
    });
  }

  const faqs: Faq[] = [];
  for (let i = 0; i < heads.length && faqs.length < max; i++) {
    const question = heads[i].text;
    if (!question.endsWith("?")) continue;
    // The answer is everything between this heading and the next one.
    const nextStart = i + 1 < heads.length ? heads[i + 1].start : html.length;
    const answer = stripHtml(html.slice(heads[i].end, nextStart)).trim();
    if (!answer) continue; // a question heading with no following prose
    faqs.push({
      question,
      answer: answer.length > MAX_ANSWER ? `${answer.slice(0, MAX_ANSWER).trimEnd()}…` : answer,
    });
  }
  return faqs;
}
