import type { PaperTrailSource } from "@/lib/letterbrace/types";

/** Display label: the page title, or the bare hostname when the title is just the URL. */
function sourceLabel(source: PaperTrailSource): string {
  const { title, url } = source;
  if (title && title !== url && !/^https?:\/\//i.test(title)) return title;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/**
 * The article's Paper Trail, rendered as a "Sources" section at the foot of the
 * story: the vetted pages the piece drew on, as a clean list of links. Data
 * comes from Letterbrace's `/published` payload (`paper_trail.sources`; see
 * lib/letterbrace/normalize.ts). Only the sources themselves are shown here —
 * the per-source contribution notes still ship in the payload (and render in
 * the Letterbrace editor), but the public page keeps to the links. Styled
 * entirely from theme tokens (`.rule-label`, `.kicker`, `.ul-link`, `--link`,
 * `--border`…) so it inherits each theme's look with no per-theme variant.
 * Renders nothing when the article has no trail.
 */
export function PostSources({
  sources,
  className = "",
}: {
  sources: PaperTrailSource[];
  className?: string;
}) {
  if (sources.length === 0) return null;

  return (
    <section className={className} aria-labelledby="sources-heading">
      <h2 id="sources-heading" className="rule-label mb-5">
        Sources
      </h2>
      <ol className="space-y-3">
        {sources.map((source, i) => (
          <li key={source.url} className="flex gap-3 text-sm leading-relaxed">
            <span
              aria-hidden
              className="kicker kicker-muted mt-0.5 shrink-0 tabular-nums"
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="ul-link min-w-0 font-medium text-foreground break-words"
            >
              {sourceLabel(source)}
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
}
