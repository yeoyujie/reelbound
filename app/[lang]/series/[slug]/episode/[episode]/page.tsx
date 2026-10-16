import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  seriesCatalog,
  type Episode,
  type EpisodeVideoSource,
} from "@/data/series";
import { EpisodeNavigation } from "@/components/episode-navigation";
import { EpisodePlayerSourceSync } from "@/components/episode-player-provider";
import {
  episodeLabel,
  episodeTitle,
  findEpisode,
  getAdjacentEpisodes,
  recapNote,
  resolveEpisodes,
  type ResolvedEpisode,
} from "@/lib/episodes";
import {
  getDictionary,
  isLocale,
  localizedText,
  type Locale,
} from "@/lib/i18n";
import type { Metadata } from "next";

export function generateStaticParams() {
  return ["en", "zh-CN"].flatMap((lang) =>
    seriesCatalog.flatMap((series) =>
      resolveEpisodes(series).map((item) => ({
        lang,
        slug: series.slug,
        episode: item.slug,
      })),
    ),
  );
}

type EpisodeRouteProps = PageProps<"/[lang]/series/[slug]/episode/[episode]">;

export async function generateMetadata({
  params,
}: EpisodeRouteProps): Promise<Metadata> {
  const { lang, slug, episode: episodeParam } = await params;
  if (!isLocale(lang)) notFound();

  const series = seriesCatalog.find((item) => item.slug === slug);
  const current = series && findEpisode(series, episodeParam);

  if (!series || !current) notFound();
  const { episode } = current;

  const seriesTitle = localizedText(series.title, lang);
  const name = episodeTitle(series, current, lang);
  const title =
    lang === "zh-CN"
      ? `${seriesTitle} · ${name}｜Reelbound`
      : `${seriesTitle} — ${name} | Reelbound`;
  const description = localizedText(episode.description ?? series.description, lang);

  return {
    title: { absolute: title },
    description,
    openGraph: {
      title,
      description,
      type: "video.episode",
    },
  };
}

export default function EpisodePage({ params }: EpisodeRouteProps) {
  return (
    <Suspense fallback={null}>
      <EpisodePageContent params={params} />
    </Suspense>
  );
}

async function EpisodePageContent({
  params,
}: {
  params: EpisodeRouteProps["params"];
}) {
  const { lang, slug, episode: episodeParam } = await params;
  if (!isLocale(lang)) notFound();
  const locale: Locale = lang;
  const dictionary = getDictionary(locale);
  const series = seriesCatalog.find((item) => item.slug === slug);
  const current = series && findEpisode(series, episodeParam);

  if (!series || !current) notFound();
  const { episode } = current;

  const { previous: previousEpisode, next: nextEpisode } = getAdjacentEpisodes(
    series,
    current,
  );
  const seriesTitle = localizedText(series.title, locale);
  const title = episodeTitle(series, current, locale);
  const recap = recapNote(current, locale);
  const videoSource = await addDouyinDimensions(episode);
  const navTarget = (item: ResolvedEpisode) => ({
    href: `/${locale}/series/${series.slug}/episode/${item.slug}`,
    label: episodeLabel(series, item, locale),
    title: item.episode.title && localizedText(item.episode.title, locale),
  });

  return (
    <>
      <EpisodePlayerSourceSync
        source={videoSource}
        title={`${seriesTitle} — ${title}`}
      />
      <div className="episode-details">
        <div className="episode-heading">
          <p className="episode-kicker">
            {episode.title
              ? `${seriesTitle} · ${episodeLabel(series, current, locale)}`
              : seriesTitle}
          </p>
          <h1 id="episode-title">{title}</h1>
        </div>
        {recap && <p className="episode-recap">{recap}</p>}
        <p className="episode-description">
          {localizedText(episode.description ?? series.description, locale)}
        </p>
      </div>

      <EpisodeNavigation
        ariaLabel={dictionary.episode}
        previous={
          previousEpisode && {
            ...navTarget(previousEpisode),
            direction: dictionary.previousEpisode,
          }
        }
        next={
          nextEpisode && {
            ...navTarget(nextEpisode),
            direction: dictionary.nextEpisode,
          }
        }
      />
    </>
  );
}

async function addDouyinDimensions(
  source: Pick<Episode, "videoId" | "videoWidth" | "videoHeight">,
): Promise<EpisodeVideoSource> {
  try {
    const endpoint = new URL(
      "https://open.douyin.com/api/douyin/v1/video/get_iframe_by_video",
    );
    endpoint.searchParams.set("video_id", source.videoId);

    const response = await fetch(endpoint, { next: { revalidate: 86400 } });
    if (!response.ok) return source;

    const result: {
      err_no?: number;
      data?: { video_width?: number; video_height?: number };
    } = await response.json();

    if (result.err_no !== 0) return source;

    return {
      ...source,
      videoWidth: result.data?.video_width ?? source.videoWidth,
      videoHeight: result.data?.video_height ?? source.videoHeight,
    };
  } catch {
    return source;
  }
}
