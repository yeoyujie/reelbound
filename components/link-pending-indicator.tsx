"use client";

import { useLinkStatus } from "next/link";

/**
 * Spinner for a clicked episode link whose page is still loading. Always
 * rendered so it never shifts layout; CSS reveals it after a short delay, so
 * prefetched (instant) navigations never show it.
 */
export function LinkPendingIndicator() {
  const { pending } = useLinkStatus();

  return (
    <span
      className={`link-pending-indicator${pending ? " is-pending" : ""}`}
      aria-hidden="true"
    />
  );
}
