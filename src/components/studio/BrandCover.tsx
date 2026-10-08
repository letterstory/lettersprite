import type { Brand } from "@/lib/brand";
import { rngFrom } from "@/lib/rng";

/**
 * Cover art drawn from the brand itself, for posts that ship without a cover.
 * Deterministic per seed (the post slug), so a post keeps its art across
 * builds. Three compositions share one grammar — quarter-circle tiles, arcs and
 * a single accent mark — so a grid of them reads as one publication rather than
 * a stock-photo collage. No text is drawn into the art; titles stay real text.
 */

type Comp = "tiles" | "arcs" | "bloom";

export function BrandCover({
  brand,
  seed,
  className = "",
  variant,
}: {
  brand: Brand;
  seed: string;
  className?: string;
  variant?: Comp;
}) {
  const r = rngFrom(seed);
  const { paper, ink, accent, accent2, tint } = brand.colors;
  // Background/foreground pairings that keep contrast inside the palette.
  const schemes = [
    { bg: tint, fg: [accent, accent2, ink, paper] },
    { bg: accent2, fg: [paper, tint, ink, accent] },
    { bg: ink, fg: [accent2, tint, paper, accent] },
    { bg: paper, fg: [accent2, accent, tint, ink] },
    { bg: accent, fg: [tint, paper, accent2, ink] },
  ];
  const s = schemes[Math.floor(r() * schemes.length)];
  const comp: Comp = variant ?? (["tiles", "arcs", "bloom"] as const)[Math.floor(r() * 3)];
  const W = 1200;
  const H = 750;
  const col = () => s.fg[Math.floor(r() * s.fg.length)];

  let body: React.ReactNode;
  if (comp === "tiles") {
    const size = 150;
    const cols = W / size;
    const rows = H / size;
    const cells: React.ReactNode[] = [];
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const roll = r();
        if (roll < 0.28) continue; // breathing room
        const rot = Math.floor(r() * 4) * 90;
        const cx = x * size;
        const cy = y * size;
        const fill = col();
        cells.push(
          roll < 0.86 ? (
            <path
              key={`${x}-${y}`}
              d={`M-0.5 -0.5 H${size + 0.5} A${size + 1} ${size + 1} 0 0 1 -0.5 ${size + 0.5} Z`}
              fill={fill}
              transform={`translate(${cx + size / 2} ${cy + size / 2}) rotate(${rot}) translate(${-size / 2} ${-size / 2})`}
            />
          ) : (
            <circle key={`${x}-${y}`} cx={cx + size / 2} cy={cy + size / 2} r={size * 0.32} fill={fill} />
          ),
        );
      }
    }
    body = cells;
  } else if (comp === "arcs") {
    const ox = r() < 0.5 ? 0 : W;
    const oy = r() < 0.5 ? 0 : H;
    const rings: React.ReactNode[] = [];
    const step = 70 + Math.floor(r() * 30);
    for (let i = 14; i > 0; i--) {
      rings.push(<circle key={i} cx={ox} cy={oy} r={i * step} fill={i % 2 ? col() : s.bg} />);
    }
    body = (
      <>
        {rings}
        <circle cx={W - ox * 0.7 + (ox ? -60 : 160)} cy={H - oy * 0.7 + (oy ? -40 : 120)} r={46} fill={s.fg[3]} />
      </>
    );
  } else {
    // bloom: four quarter circles meeting at a point, the four-point star of
    // the tile family, scaled up and set off-centre.
    const cx = W * (0.55 + r() * 0.2);
    const cy = H * (0.45 + r() * 0.15);
    const R = 260 + r() * 80;
    const petals = [0, 90, 180, 270].map((rot, i) => (
      <path
        key={rot}
        d={`M0 0 H${R} A${R} ${R} 0 0 1 0 ${R} Z`}
        fill={s.fg[i % 3]}
        transform={`translate(${cx} ${cy}) rotate(${rot})`}
        opacity={i === 3 ? 0.85 : 1}
      />
    ));
    body = (
      <>
        <circle cx={cx} cy={cy} r={R * 1.55} fill="none" stroke={s.fg[2]} strokeWidth={2} opacity={0.5} />
        <circle cx={cx} cy={cy} r={R * 1.9} fill="none" stroke={s.fg[2]} strokeWidth={2} opacity={0.3} />
        {petals}
        <circle cx={cx} cy={cy} r={R * 0.16} fill={s.bg} />
      </>
    );
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      className={className}
      role="presentation"
      aria-hidden
    >
      <rect width={W} height={H} fill={s.bg} />
      {body}
    </svg>
  );
}
