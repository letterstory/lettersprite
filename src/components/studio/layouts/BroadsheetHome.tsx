import Link from "@/components/Link";
import { bylineFor } from "@/lib/author";
import { editionDate, readingTimeLabel, sectionFor } from "@/lib/editorial";
import type { Post } from "@/lib/letterbrace/types";
import { studioHref } from "@/lib/studio";
import { StudioCover } from "../StudioCover";
import type { HomeProps } from "./NotesHome";

function longDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

/**
 * Broadsheet (NYT, FT, The Guardian): a dated front page in ruled columns —
 * the lead with its picture, a column of briefs, a numbered "most read" —
 * then a row per section.
 */
export function BroadsheetHome({ brand, data, headline }: HomeProps) {
  const [lead, ...rest] = data.posts;
  const briefs = rest.slice(0, 4);
  const mostRead = rest.slice(4, 9);
  const sections = data.sections
    .map((s) => ({ s, posts: data.posts.filter((p) => sectionFor(p) === s && p.id !== lead.id) }))
    .filter((g) => g.posts.length >= 2)
    .slice(0, 4);

  return (
    <div className="s-wrap b-front">
      <div className="b-dateline">
        <span>{longDate(editionDate(data.posts))}</span>
        <span className="b-dateline-line">{headline}</span>
      </div>

      <section className="b-top" aria-label="Front page">
        <article className="b-lead">
          <Link href={studioHref(lead)}>
            <p className="b-kicker">{sectionFor(lead)}</p>
            <h1 className="b-lead-title">{lead.title}</h1>
            {lead.dek && <p className="b-lead-dek">{lead.dek}</p>}
            <p className="b-by">By {bylineFor(lead).name}</p>
            <div className="b-lead-media">
              <StudioCover post={lead} brand={brand} />
            </div>
          </Link>
        </article>

        <div className="b-briefs">
          {briefs.map((p, i) => (
            <article key={p.id} className="b-brief" data-topic={sectionFor(p)}>
              <Link href={studioHref(p)}>
                {i === 0 && (
                  <div className="b-brief-media">
                    <StudioCover post={p} brand={brand} />
                  </div>
                )}
                <p className="b-kicker">{sectionFor(p)}</p>
                <h2 className="b-brief-title">{p.title}</h2>
                {p.dek && <p className="b-brief-dek">{p.dek}</p>}
                <p className="b-meta">{readingTimeLabel(p)}</p>
              </Link>
            </article>
          ))}
        </div>

        <aside className="b-most" aria-labelledby="most-read">
          <h2 id="most-read" className="b-rail-title">
            Most read
          </h2>
          <ol>
            {mostRead.map((p) => (
              <li key={p.id} data-topic={sectionFor(p)}>
                <Link href={studioHref(p)}>{p.title}</Link>
              </li>
            ))}
          </ol>
        </aside>
      </section>

      {sections.map((g) => (
        <section key={g.s} className="b-section" aria-label={g.s} data-topic={g.s}>
          <h2 className="b-section-title">
            <a href={`/new?topic=${encodeURIComponent(g.s)}`}>{g.s}</a>
          </h2>
          <div className="b-section-row">
            {g.posts.slice(0, 4).map((p, i) => (
              <SectionStory key={p.id} post={p} brand={brand} withArt={i === 0} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function SectionStory({ post, brand, withArt }: { post: Post; brand: HomeProps["brand"]; withArt: boolean }) {
  return (
    <article className="b-story" data-topic={sectionFor(post)}>
      <Link href={studioHref(post)}>
        {withArt && (
          <div className="b-story-media">
            <StudioCover post={post} brand={brand} />
          </div>
        )}
        <h3 className="b-story-title">{post.title}</h3>
        {post.dek && <p className="b-brief-dek">{post.dek}</p>}
        <p className="b-meta">By {bylineFor(post).name}</p>
      </Link>
    </article>
  );
}
