import { seriesCatalog } from "@/data/series";
import { episodeLabel, findEpisode } from "@/lib/episodes";
import { localizedText, type Locale } from "@/lib/i18n";

export type FeedbackEpisode = {
  series: string;
  episode: string;
  /** e.g. "The Last Human · Episode 4" */
  label: string;
  path: string;
};

/**
 * The episode a watch page's "Report a problem" link points at. Slugs come
 * from the URL or the form, so only episodes in the catalogue resolve.
 */
export function findFeedbackEpisode(
  seriesSlug: unknown,
  episodeSlug: unknown,
  locale: Locale,
): FeedbackEpisode | undefined {
  if (typeof seriesSlug !== "string" || typeof episodeSlug !== "string") return undefined;
  const series = seriesCatalog.find((item) => item.slug === seriesSlug);
  const item = series && findEpisode(series, episodeSlug);
  if (!series || !item) return undefined;

  return {
    series: series.slug,
    episode: item.slug,
    label: `${localizedText(series.title, locale)} · ${episodeLabel(series, item, locale)}`,
    path: `/${locale}/series/${series.slug}/episode/${item.slug}`,
  };
}
