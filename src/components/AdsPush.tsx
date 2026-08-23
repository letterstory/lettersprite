"use client";

import { useEffect } from "react";

/**
 * Kicks the AdSense queue for one unit. Rendered right after an `<ins>` ad slot;
 * on mount it asks AdSense to fill that unit. No-ops if the script hasn't loaded
 * (e.g. blocked), so it never throws.
 */
export function AdsPush() {
  useEffect(() => {
    try {
      // adsbygoogle is injected by the AdSense loader script.
      ((window as unknown as { adsbygoogle?: unknown[] }).adsbygoogle ||= []).push(
        {},
      );
    } catch {
      /* no-op: script blocked or not yet loaded */
    }
  }, []);
  return null;
}
