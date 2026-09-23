/**
 * Static "house"/placeholder ad creatives — purely decorative, no network, no
 * tracking, invented brands only. Each carries a bold geometric motif so the ad
 * zones read like real display ads rather than empty boxes, without shipping an
 * ad tag or impersonating a real brand. Two shapes: `leaderboard` and `box`.
 */

type Variant = "leaderboard" | "box";
type Motif = "bars" | "orbit" | "dots" | "chevron";

type Creative = {
  brand: string;
  tag: string;
  cta: string;
  bg: string;
  fg: string;
  accent: string;
  motif: Motif;
};

const CREATIVES: Creative[] = [
  { brand: "NIMBUS", tag: "Ship content 3× faster.", cta: "Start free", bg: "#c0392b", fg: "#ffffff", accent: "#f0c040", motif: "bars" },
  { brand: "ORBIT", tag: "Analytics built for editors.", cta: "Get a demo", bg: "#161418", fg: "#f0c040", accent: "#c0392b", motif: "orbit" },
  { brand: "PAPERTRAIL", tag: "Version every draft.", cta: "Try it free", bg: "#f0c040", fg: "#1a1a18", accent: "#c0392b", motif: "dots" },
  { brand: "VELOCITY", tag: "The CDN for media teams.", cta: "Learn more", bg: "#0e7c66", fg: "#ffffff", accent: "#f0c040", motif: "chevron" },
  { brand: "KETTLE", tag: "Brand voice, at scale.", cta: "Book a call", bg: "#2b4a8b", fg: "#ffffff", accent: "#f0c040", motif: "orbit" },
  { brand: "SIGNET", tag: "Approvals without the chaos.", cta: "See how", bg: "#8b3a62", fg: "#ffffff", accent: "#f0c040", motif: "bars" },
];

/** A bold abstract motif rendered as an SVG backdrop. `uid` keeps pattern ids unique. */
function MotifBg({ motif, accent, uid }: { motif: Motif; accent: string; uid: string }) {
  if (motif === "orbit") {
    return (
      <svg aria-hidden className="pointer-events-none absolute -right-8 -top-10 h-56 w-56 opacity-60">
        {[46, 36, 26, 16, 7].map((r) => (
          <circle key={r} cx="112" cy="112" r={r * 2.4} fill="none" stroke={accent} strokeWidth="4" />
        ))}
      </svg>
    );
  }
  if (motif === "chevron") {
    return (
      <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full opacity-45" preserveAspectRatio="none">
        <defs>
          <pattern id={`chev-${uid}`} width="34" height="34" patternUnits="userSpaceOnUse">
            <path d="M0 22 L17 8 L34 22" fill="none" stroke={accent} strokeWidth="5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#chev-${uid})`} />
      </svg>
    );
  }
  if (motif === "dots") {
    return (
      <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full opacity-55" preserveAspectRatio="none">
        <defs>
          <pattern id={`dot-${uid}`} width="22" height="22" patternUnits="userSpaceOnUse">
            <circle cx="6" cy="6" r="3.2" fill={accent} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#dot-${uid})`} />
      </svg>
    );
  }
  // bars — bold diagonal stripes
  return (
    <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full opacity-40" preserveAspectRatio="none">
      <defs>
        <pattern id={`bar-${uid}`} width="30" height="30" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="15" height="30" fill={accent} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#bar-${uid})`} />
    </svg>
  );
}

function Mark({ initial, fg }: { initial: string; fg: string }) {
  return (
    <span
      className="flex h-8 w-8 shrink-0 items-center justify-center border-2 font-display text-base font-extrabold"
      style={{ borderColor: fg, color: fg }}
      aria-hidden
    >
      {initial}
    </span>
  );
}

export function FakeAd({
  variant = "leaderboard",
  seed = 0,
  className = "",
  label = true,
}: {
  variant?: Variant;
  seed?: number;
  className?: string;
  label?: boolean;
}) {
  const idx = ((seed % CREATIVES.length) + CREATIVES.length) % CREATIVES.length;
  const c = CREATIVES[idx];
  const uid = `${variant}-${idx}`;

  return (
    <div className={`no-print ${className}`}>
      {label && (
        <p className="mb-1.5 text-center font-mono text-[0.58rem] uppercase tracking-[0.22em] text-muted">
          Advertisement
        </p>
      )}
      {variant === "leaderboard" ? (
        <div
          className="relative flex items-center gap-4 overflow-hidden px-6 py-5 sm:gap-6"
          style={{ backgroundColor: c.bg, color: c.fg }}
        >
          <MotifBg motif={c.motif} accent={c.accent} uid={uid} />
          <div className="relative z-10 flex items-center gap-4">
            <Mark initial={c.brand[0]} fg={c.fg} />
            <div className="min-w-0">
              <span className="font-display text-base font-extrabold uppercase tracking-[0.08em]">
                {c.brand}
              </span>
              <span className="ml-3 font-display text-base font-medium">{c.tag}</span>
            </div>
          </div>
          <span
            className="relative z-10 ml-auto hidden shrink-0 px-4 py-1.5 font-display text-xs font-bold uppercase tracking-wider sm:inline-block"
            style={{ backgroundColor: c.fg, color: c.bg }}
          >
            {c.cta} →
          </span>
        </div>
      ) : (
        <div
          className="relative flex min-h-[320px] flex-col justify-between overflow-hidden p-6"
          style={{ backgroundColor: c.bg, color: c.fg }}
        >
          <MotifBg motif={c.motif} accent={c.accent} uid={uid} />
          <div className="relative z-10 flex items-center gap-2.5">
            <Mark initial={c.brand[0]} fg={c.fg} />
            <span className="font-display text-lg font-extrabold uppercase tracking-[0.06em]">
              {c.brand}
            </span>
          </div>
          <div className="relative z-10">
            <p className="font-display text-[1.7rem] font-extrabold leading-[1.05]">{c.tag}</p>
            <span
              className="mt-4 inline-block px-4 py-2 font-display text-xs font-bold uppercase tracking-wider"
              style={{ backgroundColor: c.fg, color: c.bg }}
            >
              {c.cta} →
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
