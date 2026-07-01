import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-content px-6 py-24 text-center">
      <p className="font-heading text-6xl font-bold text-primary">404</p>
      <h1 className="mt-4 font-heading text-2xl font-bold">Post not found</h1>
      <p className="mt-3 text-muted">
        The page you&rsquo;re looking for doesn&rsquo;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block font-medium text-primary hover:underline"
      >
        ← Back home
      </Link>
    </div>
  );
}
