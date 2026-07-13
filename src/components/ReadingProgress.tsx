/**
 * A thin reading-progress bar pinned to the top of the viewport that fills as
 * the reader scrolls. Entirely pure CSS: driven by a scroll-driven animation
 * (`animation-timeline: scroll()`, see `.reading-progress` in globals.css) so it
 * needs zero client JS and simply doesn't render on browsers without support.
 */
export function ReadingProgress() {
  return <div className="reading-progress" aria-hidden />;
}
