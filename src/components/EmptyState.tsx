/** Shown on the index when the site has no posts yet. */
export function EmptyState() {
  return (
    <div className="py-16 text-center">
      <h1 className="font-heading text-2xl font-bold tracking-tight">
        Nothing here yet
      </h1>
      <p className="mx-auto mt-3 max-w-md text-muted">
        The first posts are on their way. Check back soon.
      </p>
    </div>
  );
}
