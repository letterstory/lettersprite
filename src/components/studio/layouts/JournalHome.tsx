import Link from "@/components/Link";
import { bylineFor } from "@/lib/author";
import { readingTimeLabel, sectionFor } from "@/lib/editorial";
import { formatDate } from "@/lib/format";
import { studioHref } from "@/lib/studio";
import { StudioCover } from "../StudioCover";
import type { HomeProps } from "./NotesHome";

/**
 * Research journal (Ahrefs, Intercom): the publication's real numbers up top,
 * then its research grouped by topic in ruled lists — dense, credible, scannable.
 */
export function JournalHome({ brand, data, eyebrow, headline, dek }: HomeProps) {
  const [lead, ...rest] = data.posts;
  const latest = rest.slice(0, 4);
  const stats = [
    { n: data.stats.posts, label: "Articles published" },
    { n: data.stats.sources, label: "Sources cited" },
    { n: data.stats.authors, label: "Contributors" },
    { n: (data.stats.sources / Math.max(1, data.stats.posts)).toFixed(1), label: "Sources per article" },
  ];
  const groups = data.sections
    .map((s) => ({ s, posts: data.posts.filter((p) => sectionFor(p) === s) }))
    .filter((g) => g.posts.length > 0)
    .slice(0, 5);

  return (
    <>
      <section className="s-wrap j-masthead">
        <div>
          <p className="s-eyebrow">{eyebrow}</p>
          <h1 className={`j-title ${headline.length > 70 ? "j-title-long" : ""}`}>{headline}</h1>
          {dek && <p className="s-hero-dek">{dek}</p>}
        </div>
        <dl className="j-stats">
          {stats.map((s) => (
            <div key={s.label}>
              <dt>{s.label}</dt>
              <dd>{typeof s.n === "number" ? s.n.toLocaleString("en-US") : s.n}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="s-wrap j-latest" aria-labelledby="latest">
        <h2 id="latest" className="j-label">
          Latest research
        </h2>
        <div className="j-latest-grid">
          <Link href={studioHref(lead)} className="j-lead">
            <div className="j-lead-media">
              <StudioCover post={lead} brand={brand} />
            </div>
            <p className="s-kicker">{sectionFor(lead)}</p>
            <h3 className="j-lead-title">{lead.title}</h3>
            {lead.dek && <p className="s-card-dek">{lead.dek}</p>}
            <p className="s-meta">
              <span>{bylineFor(lead).name}</span>
              <span aria-hidden>·</span>
              <span>{readingTimeLabel(lead)}</span>
            </p>
          </Link>
          <ol className="j-list">
            {latest.map((p) => (
              <JournalRow key={p.id} post={p} />
            ))}
          </ol>
        </div>
      </section>

      {groups.map((g) => (
        <section key={g.s} className="s-wrap j-group" aria-label={g.s}>
          <div className="j-group-head">
            <h2 className="j-group-title">{g.s}</h2>
            <span className="s-meta">{g.posts.length} articles</span>
            <a href={`/new?topic=${encodeURIComponent(g.s)}`} className="s-section-more">
              View all →
            </a>
          </div>
          <ol className="j-list j-list-cols">
            {g.posts.slice(0, 4).map((p) => (
              <JournalRow key={p.id} post={p} />
            ))}
          </ol>
        </section>
      ))}
    </>
  );
}

function JournalRow({ post }: { post: Parameters<typeof studioHref>[0] }) {
  const by = bylineFor(post);
  return (
    <li>
      <Link href={studioHref(post)} className="j-row">
        <span className="j-row-title">{post.title}</span>
        {post.dek && <span className="j-row-dek">{post.dek}</span>}
        <span className="s-meta">
          <span>{by.name}</span>
          <span aria-hidden>·</span>
          <span>{formatDate(post.createdAt)}</span>
          <span aria-hidden>·</span>
          <span>{readingTimeLabel(post)}</span>
          {post.paperTrail.length > 0 && (
            <>
              <span aria-hidden>·</span>
              <span>{post.paperTrail.length} sources</span>
            </>
          )}
        </span>
      </Link>
    </li>
  );
}
