import type { Post } from "@/lib/letterbrace/types";
import type { Brand } from "@/lib/brand";
import { BrandCover } from "./BrandCover";

/** A post's own cover when it has one, otherwise art drawn from the brand. */
export function StudioCover({
  post,
  brand,
  className = "",
  sizes = "(min-width: 1024px) 40vw, 100vw",
}: {
  post: Post;
  brand: Brand;
  className?: string;
  sizes?: string;
}) {
  if (post.coverImage) {
    return (
      <img
        src={post.coverImage}
        alt={post.coverImageAlt ?? ""}
        sizes={sizes}
        loading="lazy"
        className={`s-cover-img ${className}`}
      />
    );
  }
  return <BrandCover brand={brand} seed={post.slug} className={`s-cover-img ${className}`} />;
}
