import Link from "next/link";
import type { Post } from "@/lib/letterbrace/types";
import { coverImageFor } from "@/lib/covers";
import { sectionFor } from "@/lib/editorial";
import { LeadStory } from "@/components/Story";

/**
 * Gallery front (a photo-led title — travel, photography, interior design). A
 * single generous lead, then an image-first masonry where the picture *is* the
 * story: covers of varied aspect stack in columns and reveal a caption
 * (section + headline) on hover. The words stay out of the way until you look.
 */
export function GalleryHome({ posts }: { posts: Post[] }) {
  const [lead, ...rest] = posts;

  // Deterministic aspect rhythm so the masonry looks composed, not random.
  const ASPECTS = ["aspect-[4/5]", "aspect-[3/2]", "aspect-square", "aspect-[4/3]"];

  return (
    <div className="container-wide px-6 py-8">
      {lead && (
        <section className="mb-10">
          <LeadStory post={lead} ratio="16/9" />
        </section>
      )}

      {rest.length > 0 && (
        <>
          <h2 className="rule-label mb-6">The Gallery</h2>
          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
            {rest.map((post, i) => (
              <Link
                key={post.id}
                href={`/posts/${post.slug}`}
                className="group relative block break-inside-avoid overflow-hidden rounded-[var(--radius)] bg-surface"
              >
                <img
                  src={coverImageFor(post)}
                  alt=""
                  loading="lazy"
                  className={`w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04] ${ASPECTS[i % ASPECTS.length]}`}
                />
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/75 via-black/10 to-transparent opacity-100 transition-opacity duration-300 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                  <div className="p-4">
                    <span className="kicker text-white/80">{sectionFor(post)}</span>
                    <h3 className="mt-1 font-heading text-lg font-bold leading-snug text-white">
                      {post.title}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
