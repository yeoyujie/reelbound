import { notFound } from "next/navigation";
import { seriesCatalog } from "@/data/series";
import { episodeLabel, episodeRouteParams, findEpisode } from "@/lib/episodes";
import { isLocale, localizedText } from "@/lib/i18n";
import { renderEpisodeCard, shareCardContentType, shareCardSize } from "@/lib/share-card";

// Image routes don't inherit the page's static params, so prerender them here.
// `alt` stays static: generateImageMetadata would replace these params with
// empty ones at build time.
export function generateStaticParams() {
  return episodeRouteParams(seriesCatalog);
}

export const alt = "Series poster with the episode title on Reelbound";
export const size = shareCardSize;
export const contentType = shareCardContentType;

export default async function Image({
  params,
}: {
  params: Promise<{ lang: string; slug: string; episode: string }>;
}) {
  const { lang, slug, episode: episodeParam } = await params;
  if (!isLocale(lang)) notFound();

  const series = seriesCatalog.find((item) => item.slug === slug);
  const current = series && findEpisode(series, episodeParam);
  if (!series || !current) notFound();

  const label = episodeLabel(series, current, lang);
  const title = current.episode.title && localizedText(current.episode.title, lang);

  return renderEpisodeCard({
    seriesTitle: localizedText(series.title, lang),
    episodeLine: title ? `${label} · ${title}` : label,
    poster: series.thumbnail,
  });
}
