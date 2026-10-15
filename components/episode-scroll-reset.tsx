"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect } from "react";

export function EpisodeScrollReset() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    // The episode player is preserved in a shared layout, so Next.js keeps the
    // current document position when only the episode segment changes.
    if (window.matchMedia("(max-width: 600px)").matches) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [pathname]);

  return null;
}
