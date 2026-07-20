import sanitizeHtml from "sanitize-html";
import { tightenPunctuationSpacing } from "@/lib/text";

/**
 * Article bodies arrive as HTML from Letterbrace. We render them with
 * `dangerouslySetInnerHTML`, so they must be sanitized first: strip scripts,
 * event handlers and unsafe URLs while keeping normal rich-text formatting.
 */
const options: sanitizeHtml.IOptions = {
  allowedTags: [
    "h1", "h2", "h3", "h4", "h5", "h6", "p", "a", "ul", "ol", "li",
    "blockquote", "code", "pre", "em", "strong", "b", "i", "u", "s", "del",
    "ins", "mark", "sub", "sup", "br", "hr", "img", "figure", "figcaption",
    "span", "div", "table", "thead", "tbody", "tfoot", "tr", "th", "td",
    "caption", "abbr", "small", "time", "dl", "dt", "dd",
  ],
  allowedAttributes: {
    a: ["href", "name", "target", "rel", "title"],
    img: ["src", "alt", "title", "width", "height", "loading"],
    th: ["colspan", "rowspan", "scope"],
    td: ["colspan", "rowspan"],
    time: ["datetime"],
    "*": ["class", "id"],
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesByTag: { img: ["http", "https", "data"] },
  // Fix a stray space before sentence punctuation in body prose (upstream
  // generation sometimes emits "2025 ,"). Runs on text nodes only — never on
  // tags or attributes — and skips <code>/<pre>, where spacing is meaningful.
  textFilter: (text, tagName) =>
    tagName === "code" || tagName === "pre" ? text : tightenPunctuationSpacing(text),
  transformTags: {
    // Never trust outbound links from generated content.
    a: (tagName, attribs) => ({
      tagName,
      attribs: { ...attribs, rel: "noopener noreferrer nofollow" },
    }),
    // Lazy-load images by default.
    img: (tagName, attribs) => ({
      tagName,
      attribs: { ...attribs, loading: attribs.loading ?? "lazy" },
    }),
  },
};

export function sanitizePostHtml(html: string): string {
  return sanitizeHtml(html, options);
}
