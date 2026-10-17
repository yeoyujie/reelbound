"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import type { Series } from "@/data/series";
import {
  episodeLabel,
  episodeTitle,
  groupBySeason,
  hasMultipleSeasons,
  recapNote,
  seasonLabel,
} from "@/lib/episodes";
import { localizedText, type Dictionary, type Locale } from "@/lib/i18n";

type EpisodeListProps = {
  series: Series;
  currentEpisodeSlug: string;
  locale: Locale;
  dictionary: Dictionary;
};

export function EpisodeList({
  series,
  currentEpisodeSlug,
  locale,
  dictionary,
}: EpisodeListProps) {
  const listRef = useRef<HTMLDivElement>(null);
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
  }, [currentEpisodeSlug]);

  const multipleSeasons = hasMultipleSeasons(series);

  return (
    <div className="episode-list" ref={listRef}>
      {groupBySeason(series).map((season) => (
        <section
          key={season.number}
          className="episode-season"
          aria-label={multipleSeasons ? seasonLabel(season.number, locale) : undefined}
        >
          {multipleSeasons && (
            <h3 className="episode-season-heading">
              {seasonLabel(season.number, locale)}
              {season.title && <span> · {localizedText(season.title, locale)}</span>}
            </h3>
          )}
          <ol className="episode-season-list">
            {season.episodes.map((item) => {
              const { episode } = item;
              const isCurrent = item.slug === currentEpisodeSlug;
              const meta = [
                episode.title && episodeLabel(series, item, locale, { withinSeason: true }),
                recapNote(item, locale) && dictionary.recapBadge,
              ].filter(Boolean);

              return (
                <li
                  key={item.slug}
                  className={item.number === undefined ? "is-extra" : undefined}
                >
                  <Link
                    ref={isCurrent ? currentEpisodeRef : undefined}
                    className={`episode-list-item${isCurrent ? " is-current" : ""}`}
                    href={`/${locale}/series/${series.slug}/episode/${item.slug}`}
                    prefetch
                    aria-current={isCurrent ? "page" : undefined}
                  >
                    <span className="episode-number" aria-hidden="true">
                      <span className="episode-number-label">
                        {item.number !== undefined
                          ? `${String(item.number).padStart(2, "0")}${
                              item.part ? `-${item.part}` : ""
                            }`
                          : episode.kind === "special"
                            ? "SP"
                            : "—"}
                      </span>
                      {isCurrent && (
                        <span className="playing-bars">
                          <span />
                          <span />
                          <span />
                        </span>
                      )}
                    </span>
                    <span className="episode-list-copy">
                      <strong>
                        {episodeTitle(series, item, locale, { withinSeason: true })}
                      </strong>
                      {meta.length > 0 && <span>{meta.join(" · ")}</span>}
                      {isCurrent && (
                        <span className="visually-hidden">{dictionary.nowPlaying}</span>
                      )}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}
