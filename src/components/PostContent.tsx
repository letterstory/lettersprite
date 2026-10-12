import { sanitizePostHtml } from "@/lib/sanitize";
import type { SponsorDisclosure as Disclosure } from "@/lib/letterbrace/types";
import { SponsorDisclosure } from "@/components/SponsorDisclosure";

/**
 * Renders sanitized article HTML with the shared `.prose` typography. Pass
 * `dropCap` to enable an editorial drop cap on the first paragraph.
 *
 * Pass `sanitized` when `html` has *already* been sanitized (e.g. the article
 * page sanitizes once, then injects heading anchors for the table of contents
 * via `buildToc`). Defaults to sanitizing here so the component stays safe by
 * default for any other caller.
 *
 * `disclosure` is required, not optional, so no layout can render a body
 * without deciding about the sponsor line that follows it.
 */
export function PostContent({
  html,
  disclosure,
  dropCap = false,
  sanitized = false,
}: {
  html: string;
  /** The post's sponsor disclosure: its footer line is set after the body. */
  disclosure: Disclosure | null;
  dropCap?: boolean;
  sanitized?: boolean;
}) {
  const clean = sanitized ? html : sanitizePostHtml(html, disclosure);
  return (
    <>
      <div
        className={`prose ${dropCap ? "prose-dropcap" : ""}`}
        dangerouslySetInnerHTML={{ __html: clean }}
      />
      <SponsorDisclosure disclosure={disclosure} />
    </>
  );
}
