/**
 * A mock embedded social post — an original, fictional post that speaks to the
 * publication's own subject, styled as a generic social card (no real platform
 * logo or account). Static and decorative, like the social embeds a news site
 * drops into its feed.
 */

type Post = {
  name: string;
  handle: string;
  body: string;
  time: string;
  color: string;
  replies: string;
  reposts: string;
  likes: string;
};

// Invented voices, on the site's topic (content production / marketing ops).
const POSTS: Post[] = [
  {
    name: "Nadia Osei",
    handle: "nadiaships",
    body: "Hot take: the best content teams I know shipped less this quarter and still grew. Volume was never the moat — judgment is.",
    time: "2h",
    color: "#c0392b",
    replies: "34",
    reposts: "112",
    likes: "890",
  },
  {
    name: "Marcus Vane",
    handle: "mvane_ops",
    body: "If your AI content pipeline has no human review gate, you don't have a pipeline. You have a liability with a publish button.",
    time: "5h",
    color: "#2b4a8b",
    replies: "58",
    reposts: "203",
    likes: "1.4K",
  },
];

function Icon({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={path} />
    </svg>
  );
}

export function MockPost({ seed = 0, className = "" }: { seed?: number; className?: string }) {
  const p = POSTS[((seed % POSTS.length) + POSTS.length) % POSTS.length];
  const initials = p.name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <article className={`border-2 border-foreground bg-surface p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold text-white"
          style={{ backgroundColor: p.color }}
          aria-hidden
        >
          {initials}
        </span>
        <div className="min-w-0 leading-tight">
          <p className="font-display text-sm font-bold text-heading">{p.name}</p>
          <p className="text-xs text-muted">@{p.handle}</p>
        </div>
        <span aria-hidden className="ml-auto text-muted">
          <Icon path="M4 4h16v12H7l-3 3z" />
        </span>
      </div>

      <p className="mt-3 leading-snug text-heading">{p.body}</p>

      <p className="mt-3 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-muted">
        {p.time} ago
      </p>

      <div className="mt-3 flex items-center gap-6 border-t border-border pt-3 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <Icon path="M4 4h16v12H7l-3 3z" /> {p.replies}
        </span>
        <span className="flex items-center gap-1.5">
          <Icon path="M4 8l4-4 4 4M8 4v9M20 16l-4 4-4-4M16 20v-9" /> {p.reposts}
        </span>
        <span className="flex items-center gap-1.5">
          <Icon path="M12 20s-7-4.5-7-9a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 4.5-7 9-7 9z" /> {p.likes}
        </span>
      </div>
    </article>
  );
}
