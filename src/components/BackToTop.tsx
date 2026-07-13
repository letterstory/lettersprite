/**
 * A floating "back to top" control. It's a plain `#top` anchor — works with JS
 * off — that stays hidden until the reader scrolls, revealed by a pure-CSS
 * scroll-driven animation (see `.to-top` in globals.css). The article foot also
 * carries a guaranteed text link, so nothing depends on scroll-timeline support.
 */
export function BackToTop() {
  return (
    <a href="#top" className="to-top no-print" aria-label="Back to top" title="Back to top">
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="m6 15 6-6 6 6" />
      </svg>
    </a>
  );
}
