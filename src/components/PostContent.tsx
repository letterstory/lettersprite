import { sanitizePostHtml } from "@/lib/sanitize";

/** Renders sanitized article HTML with the shared `.prose` typography. */
export function PostContent({ html }: { html: string }) {
  const clean = sanitizePostHtml(html);
  return <div className="prose" dangerouslySetInnerHTML={{ __html: clean }} />;
}
