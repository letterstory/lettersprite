import type { Heading } from "@/lib/toc";

/**
 * The "In this article" contents list built from the article's h2/h3 outline
 * (see `lib/toc.ts`). Pure anchor links to the heading ids baked into the body
 * — no client JS. In-page jumps glide via `scroll-behavior: smooth` and clear
 * the sticky masthead via `scroll-margin-top` (both in globals.css).
 *
 * Rendered only for genuinely long pieces (>= `minHeadings`), so short posts
 * stay clean.
 */
export function TableOfContents({
  headings,
  className = "",
  minHeadings = 3,
}: {
  headings: Heading[];
  className?: string;
  minHeadings?: number;
}) {
  if (headings.length < minHeadings) return null;
  return (
    <nav aria-label="In this article" className={`toc no-print ${className}`}>
      <p className="toc-title">In this article</p>
      <ol className="toc-list mt-3 flex flex-col gap-2 text-sm">
        {headings.map((h) => (
          <li
            key={h.id}
            className={`toc-item leading-snug ${h.level === 3 ? "toc-sub" : ""}`}
          >
            <a href={`#${h.id}`} className="ul-link">
              {h.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
