"use client";

import Link from "next/link";
import type { PointerEvent } from "react";

type EpisodeNavTarget = {
  href: string;
  label: string;
  title?: string;
};

type EpisodeNavigationProps = {
  ariaLabel: string;
  previous?: EpisodeNavTarget & { direction: string };
  next?: EpisodeNavTarget & { direction: string };
};

/** Keeps the spotlight under the pointer without re-rendering. */
function trackSpotlight(event: PointerEvent<HTMLAnchorElement>) {
  if (event.pointerType !== "mouse") return;
  const target = event.currentTarget;
  const rect = target.getBoundingClientRect();
  target.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
  target.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
}

export function EpisodeNavigation({ ariaLabel, previous, next }: EpisodeNavigationProps) {
  return (
    <nav className="episode-navigation" aria-label={ariaLabel}>
      {previous ? (
        <EpisodeNavLink {...previous} rel="prev" />
      ) : (
        <span aria-hidden="true" />
      )}
      {next ? <EpisodeNavLink {...next} rel="next" /> : <span aria-hidden="true" />}
    </nav>
  );
}

function EpisodeNavLink({
  href,
  label,
  title,
  direction,
  rel,
}: EpisodeNavTarget & { direction: string; rel: "prev" | "next" }) {
  return (
    <Link
      className={`episode-nav-link is-${rel}`}
      href={href}
      rel={rel}
      onPointerEnter={trackSpotlight}
      onPointerMove={trackSpotlight}
    >
      <span className="episode-nav-arrow" aria-hidden="true">
        <svg viewBox="0 0 16 16">
          <path d={rel === "next" ? "M3 8h10M9 4l4 4-4 4" : "M13 8H3M7 4 3 8l4 4"} />
        </svg>
      </span>
      <span className="episode-nav-copy">
        <span className="episode-nav-direction">{direction}</span>
        <strong>
          {label}
          {title && <span className="episode-nav-title"> · {title}</span>}
        </strong>
      </span>
    </Link>
  );
}
