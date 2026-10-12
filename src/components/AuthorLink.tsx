import type { ReactNode } from "react";
import Link from "@/components/Link";
import { authorHref, type Byline } from "@/lib/author";

/**
 * A byline name, linked to the author's `/authors/[slug]` page when the byline
 * has one. A byline with no profile (a `site_byline` post) has no page to link
 * to, so it is set as plain text in the same style.
 */
export function AuthorLink({
  byline,
  className,
  children,
}: {
  byline: Byline;
  className?: string;
  children?: ReactNode;
}) {
  const href = authorHref(byline);
  const content = children ?? byline.name;
  if (!href) return <span className={className}>{content}</span>;
  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}
