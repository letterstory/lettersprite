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
 * story: the vetted pages the piece drew on, each with a one-line note on what
 * it contributed. Data comes from Letterbrace's `/published` payload
 * (`paper_trail.sources`; see lib/letterbrace/normalize.ts). Styled entirely
 * from theme tokens (`.rule-label`, `.kicker`, `.ul-link`, `--link`,
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
      <ol className="space-y-4">
        {sources.map((source, i) => (
          <li key={source.url} className="flex gap-3 text-sm leading-relaxed">
            <span
              aria-hidden
              className="kicker kicker-muted mt-1 shrink-0 tabular-nums"
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="min-w-0">
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="ul-link font-medium text-foreground break-words"
              >
                {sourceLabel(source)}
              </a>
              {source.note && (
                <span className="mt-0.5 block text-fg-soft">{source.note}</span>
              )}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
