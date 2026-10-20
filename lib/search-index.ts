import { seriesCatalog, type Series } from "@/data/series";
import { episodeLabel, getEntryEpisode, resolveEpisodes } from "@/lib/episodes";
import { tagLabels } from "@/lib/i18n";
import type { SearchIndex, SearchIndexEpisode, SearchIndexSeries } from "@/lib/search";

function indexEpisodes(series: Series): SearchIndexEpisode[] {
  return resolveEpisodes(series).map((item) => ({
    slug: item.slug,
    kind: item.episode.kind ?? "episode",
    season: item.season,
    number: item.number,
    label: {
      en: episodeLabel(series, item, "en"),
      zh: episodeLabel(series, item, "zh-CN"),
    },
    title: item.episode.title,
    description: item.episode.description,
  }));
}

/**
 * The slim, bilingual catalogue the search palette downloads. It leaves out
 * video IDs and player sizes, which search never needs.
 */
export function buildSearchIndex(): SearchIndex {
  return {
    series: seriesCatalog.flatMap((series): SearchIndexSeries[] => {
      const entry = getEntryEpisode(series);
      if (!entry) return [];

      return [
        {
          slug: series.slug,
          title: series.title,
          description: series.description,
          tags: (series.tags ?? []).map((tag) => tagLabels[tag]),
          thumbnail: series.thumbnail,
          episodeCount: series.episodes.length,
          entryEpisode: entry.slug,
          episodes: indexEpisodes(series),
        },
      ];
    }),
  };
}
