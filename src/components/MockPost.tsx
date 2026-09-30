/**
 * Mock embedded social posts — original, fictional posts on the publication's own
 * subject, styled as generic social cards (no real platform logos or accounts).
 * Two shapes: a Twitter-style text post and an Instagram-style image post. Static
 * and decorative, like the social embeds a news site drops into its feed.
 */

type Variant = "twitter" | "instagram";

type Tweet = {
  name: string; handle: string; body: string; time: string; color: string;
  replies: string; reposts: string; likes: string;
};

type Gram = {
  name: string; handle: string; caption: string; time: string; color: string; likes: string;
};

const TWEETS: Tweet[] = [
  { name: "Priya Nadar", handle: "buildlog", body: "The teams shipping agents to real users aren't smarter — they just treat provisioning as an API, not a checklist. Idempotency is the whole game.", time: "2h", color: "#00c896", replies: "41", reposts: "168", likes: "1.2K" },
  { name: "Marcus Vane", handle: "mvane_dev", body: "If your multi-tenant agent product leaks one tenant's Slack token into another's runtime, nothing else you built matters. Isolation first.", time: "5h", color: "#7c3aed", replies: "58", reposts: "203", likes: "1.4K" },
];

const GRAMS: Gram[] = [
  { name: "Dev Okafor", handle: "okaforbuilds", caption: "Shipped multi-tenant agent provisioning today — 400 orgs, zero manual setup. The API-first bet paid off. 🚀", time: "3h", color: "#7c3aed", likes: "1,204" },
  { name: "Lena Ortiz", handle: "lenaships", caption: "Watching agents tear down cleanly across tenants never gets old. Idempotency is a love language.", time: "8h", color: "#00c896", likes: "842" },
];

function Icon({ path, fill = "none" }: { path: string; fill?: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill={fill} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={path} />
    </svg>
  );
}

function Avatar({ name, color }: { name: string; color: string }) {
  const initials = name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <span
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold text-white"
      style={{ backgroundColor: color }}
      aria-hidden
    >
      {initials}
    </span>
  );
}

export function MockPost({
  variant = "twitter",
  seed = 0,
  image,
  className = "",
}: {
  variant?: Variant;
  seed?: number;
  image?: string;
  className?: string;
}) {
  if (variant === "instagram") {
    const g = GRAMS[((seed % GRAMS.length) + GRAMS.length) % GRAMS.length];
    return (
      <article className={`overflow-hidden border-2 border-foreground bg-surface ${className}`}>
        <div className="flex items-center gap-3 p-3">
          <Avatar name={g.name} color={g.color} />
          <div className="min-w-0 leading-tight">
            <p className="font-display text-sm font-bold text-heading">@{g.handle}</p>
            <p className="text-xs text-muted">{g.name}</p>
          </div>
          <span aria-hidden className="ml-auto text-muted">···</span>
        </div>
        {image && (
          <div className="aspect-square w-full overflow-hidden bg-surfaceAlt">
            <img src={image} alt="" loading="lazy" className="h-full w-full object-cover" />
          </div>
        )}
        <div className="flex items-center gap-4 px-3 pt-3 text-heading">
          <Icon path="M12 20s-7-4.5-7-9a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 4.5-7 9-7 9z" />
          <Icon path="M4 4h16v12H7l-3 3z" />
          <Icon path="M22 2 11 13M22 2l-7 20-4-9-9-4z" />
          <Icon path="M6 3h12v18l-6-4-6 4z" />
        </div>
        <p className="px-3 pt-2 font-display text-sm font-bold text-heading">{g.likes} likes</p>
        <p className="px-3 pt-1 text-sm leading-snug text-heading">
          <span className="font-display font-bold">@{g.handle}</span> {g.caption}
        </p>
        <p className="px-3 pb-3 pt-2 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-muted">
          {g.time} ago
        </p>
      </article>
    );
  }

  const t = TWEETS[((seed % TWEETS.length) + TWEETS.length) % TWEETS.length];
  return (
    <article className={`border-2 border-foreground bg-surface p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <Avatar name={t.name} color={t.color} />
        <div className="min-w-0 leading-tight">
          <p className="font-display text-sm font-bold text-heading">{t.name}</p>
          <p className="text-xs text-muted">@{t.handle}</p>
        </div>
        <span aria-hidden className="ml-auto text-muted"><Icon path="M4 4h16v12H7l-3 3z" /></span>
      </div>
      <p className="mt-3 leading-snug text-heading">{t.body}</p>
      <p className="mt-3 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-muted">{t.time} ago</p>
      <div className="mt-3 flex items-center gap-6 border-t border-border pt-3 text-xs text-muted">
        <span className="flex items-center gap-1.5"><Icon path="M4 4h16v12H7l-3 3z" /> {t.replies}</span>
        <span className="flex items-center gap-1.5"><Icon path="M4 8l4-4 4 4M8 4v9M20 16l-4 4-4-4M16 20v-9" /> {t.reposts}</span>
        <span className="flex items-center gap-1.5"><Icon path="M12 20s-7-4.5-7-9a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 4.5-7 9-7 9z" /> {t.likes}</span>
      </div>
    </article>
  );
}
