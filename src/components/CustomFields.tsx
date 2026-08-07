/** Humanize a field key ("cta_url" → "Cta Url") for a display label. */
function humanize(key: string): string {
  return key
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** A value that should render as an external link. */
function isUrl(value: string): boolean {
  return /^https?:\/\//i.test(value.trim());
}

/**
 * The post's custom fields for a non-Classic collection type ("configurable
 * collection fields"), rendered as a labelled definition list. URL values become
 * links; everything else renders as text. Data comes from Letterbrace's
 * `/published` payload (`custom_fields`; see lib/letterbrace/normalize.ts).
 * Styled entirely from theme tokens (`.rule-label`, `.kicker`, `.ul-link`,
 * `--foreground`…) so it inherits each theme's look with no per-theme variant.
 *
 * Renders nothing when there are no custom fields — which is every Classic post
 * (Classic ships no `custom_fields`). That is what keeps a Classic deployment's
 * pages byte-for-byte unchanged even with this component wired in.
 */
export function CustomFields({
  fields,
  className = "",
}: {
  fields: Record<string, string>;
  className?: string;
}) {
  const entries = Object.entries(fields).filter(([, v]) => v && v.trim());
  if (entries.length === 0) return null;

  return (
    <section className={className} aria-labelledby="details-heading">
      <h2 id="details-heading" className="rule-label mb-5">
        Details
      </h2>
      <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
        {entries.map(([key, value]) => (
          <div key={key} className="min-w-0">
            <dt className="kicker kicker-muted mb-1">{humanize(key)}</dt>
            <dd className="min-w-0 break-words text-sm leading-relaxed text-foreground">
              {isUrl(value) ? (
                <a
                  href={value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ul-link font-medium"
                >
                  {value}
                </a>
              ) : (
                value
              )}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
