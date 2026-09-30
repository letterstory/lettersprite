import { useEffect, useState } from "react";

/**
 * Reader "Following" list — a personal feed with no accounts and no database.
 * The set of followed sections/authors lives in localStorage on the reader's
 * own device (like the dark/light preference), so a fully-static deployment can
 * still offer a personalized feed. Every follow control and the /following page
 * read the same key and stay in sync via a custom event (same tab) + the native
 * `storage` event (other tabs).
 */

export const FOLLOW_STORAGE_KEY = "ls-following";
const CHANGE_EVENT = "ls-followchange";

export type FollowKind = "section" | "author";
export type FollowEntry = { kind: FollowKind; slug: string; name: string };

/** Read + validate the persisted follow list (safe on the server → []). */
export function readFollowing(): FollowEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(FOLLOW_STORAGE_KEY) || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is FollowEntry =>
        !!e &&
        (e.kind === "section" || e.kind === "author") &&
        typeof e.slug === "string" &&
        typeof e.name === "string",
    );
  } catch {
    return [];
  }
}

function writeFollowing(list: FollowEntry[]) {
  try {
    window.localStorage.setItem(FOLLOW_STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* private mode / quota — the feed just won't persist */
  }
  try {
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
  } catch {
    /* no-op */
  }
}

export function isFollowing(list: FollowEntry[], kind: FollowKind, slug: string): boolean {
  return list.some((e) => e.kind === kind && e.slug === slug);
}

/** Follow if not followed, unfollow if already followed. Returns the new list. */
export function toggleFollow(entry: FollowEntry): FollowEntry[] {
  const list = readFollowing();
  const next = isFollowing(list, entry.kind, entry.slug)
    ? list.filter((e) => !(e.kind === entry.kind && e.slug === entry.slug))
    : [...list, entry];
  writeFollowing(next);
  return next;
}

/**
 * Subscribe to the reader's follow list. Returns `[list, mounted]`: `mounted`
 * is false until the first client effect runs, so callers can avoid a hydration
 * flash of the "not following anything" state for readers who do follow things.
 */
export function useFollowing(): [FollowEntry[], boolean] {
  const [list, setList] = useState<FollowEntry[]>([]);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const sync = () => setList(readFollowing());
    sync();
    setMounted(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key === FOLLOW_STORAGE_KEY) sync();
    };
    window.addEventListener(CHANGE_EVENT, sync);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener("storage", onStorage);
    };
  }, []);
  return [list, mounted];
}
