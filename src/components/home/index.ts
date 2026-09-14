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

type HomeLayout = ComponentType<{ posts: Post[] }>;

/** Theme `home` key → its front-page renderer (see the Theme type). */
const HOME_LAYOUTS: Record<string, HomeLayout> = {
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
};

/** Resolve a theme's home layout, falling back to the default grid. */
export function homeLayoutFor(key: string): HomeLayout {
  return HOME_LAYOUTS[key] ?? GridHome;
}
