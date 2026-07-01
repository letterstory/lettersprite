/** Shown on the index when a collection is connected but has no posts yet. */
export function EmptyState() {
  return (
    <div className="py-16 text-center">
      <h1 className="font-heading text-2xl font-bold tracking-tight">
        Nothing here yet
      </h1>
      <p className="mx-auto mt-3 max-w-md text-muted">
        No published posts were found for this collection. Check back soon.
      </p>
    </div>
  );
}
