import { useMemo, useSyncExternalStore } from "react";

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

/** Validate a raw stored follow list (anything malformed → []). */
export function parseFollowing(raw: string | null): FollowEntry[] {
  try {
    const parsed = JSON.parse(raw || "[]");
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

function readRaw(): string {
  try {
    return window.localStorage.getItem(FOLLOW_STORAGE_KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

/** Read + validate the persisted follow list (safe on the server → []). */
export function readFollowing(): FollowEntry[] {
  if (typeof window === "undefined") return [];
  return parseFollowing(readRaw());
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

function subscribe(onChange: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === FOLLOW_STORAGE_KEY) onChange();
  };
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

/**
 * Subscribe to the reader's follow list. Returns `[list, mounted]`: `mounted`
 * is false on the server and during hydration (the server snapshot is `null`),
 * so callers can avoid a hydration flash of the "not following anything" state
 * for readers who do follow things. The snapshot is the raw stored string, so
 * it is stable between changes and only re-parsed when it actually changes.
 */
export function useFollowing(): [FollowEntry[], boolean] {
  const raw = useSyncExternalStore<string | null>(subscribe, readRaw, () => null);
  const list = useMemo(() => parseFollowing(raw), [raw]);
  return [list, raw !== null];
}
