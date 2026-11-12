import type { ComponentType } from "react";
import type { Post } from "@/lib/letterbrace/types";
import { BroadsheetHome } from "./BroadsheetHome";
import { ColumnHome } from "./ColumnHome";
import { FeedHome } from "./FeedHome";
import { GlossyHome } from "./GlossyHome";
import { GridHome } from "./GridHome";
import { MosaicHome } from "./MosaicHome";
import { CoverHome } from "./CoverHome";
import { GalleryHome } from "./GalleryHome";
import { DigestHome } from "./DigestHome";
import { TimelineHome } from "./TimelineHome";
import { BoardHome } from "./BoardHome";
import { AtlanticHome } from "./AtlanticHome";
import { WireHome } from "./WireHome";
import { BoomHome } from "./BoomHome";
import { FolioHome } from "./FolioHome";
import { KioskHome } from "./KioskHome";
import { VitrineHome } from "./VitrineHome";
import { CommonsHome } from "./CommonsHome";
import { BlitzHome } from "./BlitzHome";
import { QuartoHome } from "./QuartoHome";
import { StarkHome } from "./StarkHome";
import { FluxHome } from "./FluxHome";
import { RelayHome } from "./RelayHome";
import { RiotHome } from "./RiotHome";
import { CircuitHome } from "./CircuitHome";
import { CanvasHome } from "./CanvasHome";
import { CodexHome } from "./CodexHome";

type HomeRenderer = ComponentType<{ posts: Post[] }>;

/** Theme `home` key → its front-page renderer (see the Theme type). */
const HOME_LAYOUTS: Record<string, HomeRenderer> = {
  broadsheet: BroadsheetHome,
  feed: FeedHome,
  mosaic: MosaicHome,
  glossy: GlossyHome,
  column: ColumnHome,
  grid: GridHome,
  cover: CoverHome,
  gallery: GalleryHome,
  digest: DigestHome,
  timeline: TimelineHome,
  board: BoardHome,
  atlantic: AtlanticHome,
  wire: WireHome,
  boom: BoomHome,
  folio: FolioHome,
  kiosk: KioskHome,
  vitrine: VitrineHome,
  commons: CommonsHome,
  blitz: BlitzHome,
  quarto: QuartoHome,
  stark: StarkHome,
  flux: FluxHome,
  relay: RelayHome,
  riot: RiotHome,
  circuit: CircuitHome,
  canvas: CanvasHome,
  codex: CodexHome,
};

/**
 * Render a theme's front page through its layout, falling back to the default
 * grid. The renderer is a module-level component looked up by key, so its
 * identity is stable across renders.
 */
export function HomeLayout({ layout, posts }: { layout: string; posts: Post[] }) {
  const Home = HOME_LAYOUTS[layout] ?? GridHome;
  return <Home posts={posts} />;
}
