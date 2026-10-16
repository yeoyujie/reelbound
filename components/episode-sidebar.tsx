"use client";

import { useParams } from "next/navigation";
import { seriesCatalog } from "@/data/series";
import { EpisodeList } from "@/components/episode-list";
import { findEpisode, getStoryEpisodes } from "@/lib/episodes";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";

export function EpisodeSidebar() {
  const { lang, slug, episode: episodeParam } = useParams<{
    slug: string;
    episode: string;
    lang: string;
  }>();
  if (!isLocale(lang)) return null;
  const locale: Locale = lang;
  const dictionary = getDictionary(locale);
  const series = seriesCatalog.find((item) => item.slug === slug);

  if (!series || !findEpisode(series, episodeParam)) {
    return null;
  }

  return (
    <aside className="episode-sidebar" aria-labelledby="episode-list-title">
      <div className="episode-list-heading">
        <div>
          <p className="eyebrow">{dictionary.series}</p>
          <h2 id="episode-list-title">{dictionary.episodes}</h2>
        </div>
        <span>{getStoryEpisodes(series).length || series.episodes.length}</span>
      </div>

      <EpisodeList
        series={series}
        currentEpisodeSlug={episodeParam}
        locale={locale}
        dictionary={dictionary}
      />
    </aside>
  );
}
