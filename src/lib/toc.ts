/**
 * Build-time table of contents.
 *
 * Given the article's *sanitized* HTML, inject a stable anchor `id` onto every
 * section heading (h2/h3) and extract the heading outline. Both the ids and the
 * outline are derived purely from the content, so they're deterministic across
 * builds — the same article always produces the same anchors. No DOM, no client
 * JS: this runs once at build and the anchors are baked into the static HTML.
 */

import { slugify, stripHtml } from "./letterbrace/normalize";

export interface Heading {
  /** Anchor id, e.g. `#small-fast-and-specialized`. */
  id: string;
  /** Plain-text heading label. */
  text: string;
  /** Nesting level (2 = section, 3 = subsection). */
  level: 2 | 3;
}

/**
 * Inject anchor ids into h2/h3 headings and return the outline alongside the
 * augmented HTML. Existing ids are respected; derived ids are slugified and
 * de-duplicated. Empty headings are left untouched and skipped in the outline.
 */
export function buildToc(html: string): { html: string; headings: Heading[] } {
  const headings: Heading[] = [];
  const used = new Set<string>();

  // Byte ranges occupied by <pre>/<code> blocks. A literal <h2>/<h3> inside a
  // code sample is not a section heading and must not enter the outline.
  const skip: Array<[number, number]> = [];
  for (const m of html.matchAll(/<(pre|code)\b[^>]*>[\s\S]*?<\/\1>/gi)) {
    if (m.index !== undefined) skip.push([m.index, m.index + m[0].length]);
  }
  const insideSkip = (i: number) => skip.some(([a, b]) => i >= a && i < b);

  const out = html.replace(
    /<(h[23])\b([^>]*)>([\s\S]*?)<\/\1>/gi,
    (whole, tag: string, attrs: string, inner: string, offset: number) => {
      if (insideSkip(offset)) return whole;
      const level = tag.toLowerCase() === "h2" ? 2 : 3;
      const text = stripHtml(inner).trim();
      if (!text) return whole; // skip empty/decorative headings

      // Reuse a pre-existing id only when it is already a clean, resolvable
      // fragment token AND not already taken; otherwise derive one from the
      // heading text. Then de-duplicate against every id seen so far — for BOTH
      // reused and derived ids — so the document never carries duplicate anchors.
      const existing = /\bid\s*=\s*["']([^"']*)["']/i.exec(attrs);
      const reusable = Boolean(
        existing && /^[A-Za-z][\w-]*$/.test(existing[1]) && !used.has(existing[1]),
      );
      const base = reusable ? existing![1] : slugify(text) || "section";
      let id = base;
      for (let n = 2; used.has(id); n++) id = `${base}-${n}`;
      used.add(id);
      headings.push({ id, text, level });

      // Emit the (possibly de-duplicated) id, stripping any pre-existing id we
      // didn't keep so the element never ends up with two id attributes.
      if (reusable && id === existing![1]) {
        return `<${tag}${attrs}>${inner}</${tag}>`;
      }
      const attrsNoId = attrs.replace(/\s*\bid\s*=\s*["'][^"']*["']/i, "");
      return `<${tag}${attrsNoId} id="${id}">${inner}</${tag}>`;
    },
  );

  return { html: out, headings };
}
