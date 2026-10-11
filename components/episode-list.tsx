"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import type { Episode } from "@/data/series";
import type { Dictionary, Locale } from "@/lib/i18n";

type EpisodeListProps = {
  episodes: Episode[];
  seriesSlug: string;
  currentEpisodeNumber: number;
  locale: Locale;
  dictionary: Dictionary;
};

export function EpisodeList({
  episodes,
  seriesSlug,
  currentEpisodeNumber,
  locale,
  dictionary,
}: EpisodeListProps) {
  const listRef = useRef<HTMLOListElement>(null);
  const currentEpisodeRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const list = listRef.current;
    const currentEpisode = currentEpisodeRef.current;

    if (!list || !currentEpisode) {
      return;
    }

    const revealCurrentEpisode = () => {
      if (list.scrollHeight <= list.clientHeight) return;

      const listBounds = list.getBoundingClientRect();
      const episodeBounds = currentEpisode.getBoundingClientRect();

      if (episodeBounds.top < listBounds.top) {
        list.scrollTop -= listBounds.top - episodeBounds.top;
      } else if (episodeBounds.bottom > listBounds.bottom) {
        list.scrollTop += episodeBounds.bottom - listBounds.bottom;
      }
    };

    revealCurrentEpisode();

    const resizeObserver = new ResizeObserver(revealCurrentEpisode);
    resizeObserver.observe(list);

    return () => resizeObserver.disconnect();
  }, [currentEpisodeNumber]);

  return (
    <ol className="episode-list" ref={listRef}>
      {episodes.map((episode) => {
        const isCurrent = episode.number === currentEpisodeNumber;

        return (
          <li key={episode.number}>
            <Link
              ref={isCurrent ? currentEpisodeRef : undefined}
              className={`episode-list-item${isCurrent ? " is-current" : ""}`}
              href={`/${locale}/series/${seriesSlug}/episode/${episode.number}`}
              aria-current={isCurrent ? "page" : undefined}
            >
              <span className="episode-number">
                {String(episode.number).padStart(2, "0")}
              </span>
              <span className="episode-list-copy">
                <strong>
                  {locale === "zh-CN" ? `第 ${episode.number} 集` : episode.title}
                </strong>
                <span>
                  {isCurrent
                    ? dictionary.nowPlaying
                    : locale === "zh-CN"
                      ? `第 ${episode.number} 集`
                      : `Episode ${episode.number}`}
                </span>
              </span>
              {isCurrent && (
                <span className="playing-indicator" aria-hidden="true">
                  ●
                </span>
              )}
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
