import type { CustomField } from "@/lib/letterbrace/types";

/** A field that should render as a call-to-action button. */
function isCta(field: CustomField): boolean {
  return field.type === "cta" || field.type === "url" || /^https?:\/\//i.test(field.value.trim());
}

/**
 * The post's custom fields for a non-Classic collection type ("configurable
 * collection fields"), rendered as a sidebar fact card: labelled facts as a
 * definition list, and any call-to-action field as a full-width button
 * (`.pill-solid`, the theme's primary button). Both the field labels and the CTA
 * button text come straight from the `/published` payload — the sender
 * (Letterstory) controls exactly how each reads; nothing is guessed here.
 * Styled entirely from theme tokens (`--surface`, `--border`, `--radius`,
 * `.rule-label`, `.kicker`, `.pill-solid`…) so it inherits every theme's look.
 *
 * Renders nothing when there are no custom fields — which is every Classic post
 * (Classic ships no `custom_fields`). That keeps a Classic deployment's pages
 * byte-for-byte unchanged.
 */
export function CustomFields({
  fields,
  className = "",
}: {
  fields: CustomField[];
  className?: string;
}) {
  if (fields.length === 0) return null;

  const facts = fields.filter((f) => !isCta(f));
  const ctas = fields.filter(isCta);

  return (
    <section
      aria-labelledby="details-heading"
      className={`rounded-[var(--radius)] border border-border bg-surface p-5 ${className}`}
    >
      <h2 id="details-heading" className="rule-label mb-4">
        Details
      </h2>

      {facts.length > 0 && (
        <dl className="space-y-3">
          {facts.map((f) => (
            <div key={f.key}>
              <dt className="kicker kicker-muted mb-0.5">{f.label}</dt>
              <dd className="break-words text-sm leading-snug text-foreground">
                {f.value}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {ctas.length > 0 && (
        <div className={facts.length > 0 ? "mt-5 border-t border-border pt-5" : ""}>
          {ctas.map((f) => (
            <a
              key={f.key}
              href={f.value}
              target="_blank"
              rel="noopener noreferrer"
              className="pill-solid group flex w-full items-center justify-center gap-1.5 rounded-[var(--radius)] px-5 py-3 text-[0.8rem] font-semibold tracking-wide transition-opacity hover:opacity-90"
            >
              {f.label}
              <span
                aria-hidden
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              >
                →
              </span>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
