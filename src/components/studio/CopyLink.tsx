"use client";

import { useState } from "react";

export function CopyLink() {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="s-chip"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(window.location.href);
          setDone(true);
          setTimeout(() => setDone(false), 1600);
        } catch {
          /* clipboard blocked: nothing to do */
        }
      }}
    >
      {done ? "Copied" : "Copy link"}
    </button>
  );
}
