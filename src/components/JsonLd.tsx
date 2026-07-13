/**
 * Renders a JSON-LD structured-data block. Per Next's own guidance we emit a
 * plain <script type="application/ld+json"> (not next/script) in the server
 * component, and XSS-escape `<` so a stray tag in the data can't break out.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
