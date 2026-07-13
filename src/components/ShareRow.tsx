import type { ReactNode } from "react";

/**
 * Social share links. Static hrefs (share intents + mailto), so they work in a
 * fully static build with no client JS — while still giving articles the
 * share-bar furniture readers expect from a real publication.
 */

function ShareLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer nofollow"
      aria-label={label}
      title={label}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-primary hover:bg-tint hover:text-primary"
    >
      {children}
    </a>
  );
}

export function ShareRow({
  url,
  title,
  withLabel = false,
}: {
  url: string;
  title: string;
  withLabel?: boolean;
}) {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  return (
    <div className="no-print flex items-center gap-3">
      {withLabel && (
        <span className="kicker mr-1">Share</span>
      )}
      <div className="flex items-center gap-2">
        <ShareLink href={`https://twitter.com/intent/tweet?text=${t}&url=${u}`} label="Share on X">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
            <path d="M18.9 1.6h3.5l-7.6 8.7L23.7 22h-7l-5.5-7.2L4.9 22H1.4l8.1-9.3L.7 1.6h7.2l5 6.6 5.9-6.6Zm-1.2 18.3h1.9L6.9 3.6H4.8l12.9 16.3Z" />
          </svg>
        </ShareLink>
        <ShareLink href={`https://www.linkedin.com/sharing/share-offsite/?url=${u}`} label="Share on LinkedIn">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
            <path d="M6.94 5A1.94 1.94 0 1 1 3.06 5a1.94 1.94 0 0 1 3.88 0ZM3.3 8.4h3.28V21H3.3V8.4Zm5.2 0h3.14v1.72h.05c.44-.83 1.5-1.72 3.1-1.72 3.32 0 3.93 2.18 3.93 5.02V21h-3.28v-5.9c0-1.4-.02-3.2-1.95-3.2-1.96 0-2.26 1.53-2.26 3.1V21H8.5V8.4Z" />
          </svg>
        </ShareLink>
        <ShareLink href={`https://www.facebook.com/sharer/sharer.php?u=${u}`} label="Share on Facebook">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
            <path d="M14 8.5V7c0-.8.5-1 .9-1H17V3h-2.6C11.7 3 11 5 11 6.4v2.1H9V12h2v9h3v-9h2.3l.4-3.5H14Z" />
          </svg>
        </ShareLink>
        <ShareLink href={`mailto:?subject=${t}&body=${u}`} label="Share by email">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="m3 7 9 6 9-6" />
          </svg>
        </ShareLink>
      </div>
    </div>
  );
}
