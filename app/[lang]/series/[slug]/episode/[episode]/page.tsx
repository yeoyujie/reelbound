import { notFound } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import {
  seriesCatalog,
  type Episode,
  type EpisodeVideoSource,
} from "@/data/series";
import { EpisodePlayerSourceSync } from "@/components/episode-player-provider";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";

export function generateStaticParams() {
  return ["en", "zh-CN"].flatMap((lang) =>
    seriesCatalog.flatMap((series) =>
      series.episodes.map((episode) => ({
        lang,
        slug: series.slug,
        episode: String(episode.number),
      })),
    ),
  );
}

type EpisodeRouteProps = PageProps<"/[lang]/series/[slug]/episode/[episode]">;

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
  const episodeNumber = /^\d+$/.test(episodeParam)
    ? Number(episodeParam)
    : NaN;
  const episode = series?.episodes.find((item) => item.number === episodeNumber);

  if (!series || !episode) notFound();

  const currentIndex = series.episodes.findIndex(
    (item) => item.number === episode.number,
  );
  const previousEpisode = series.episodes[currentIndex - 1];
  const nextEpisode = series.episodes[currentIndex + 1];
  const videoSource = await addDouyinDimensions(episode);

  return (
    <>
      <EpisodePlayerSourceSync
        source={videoSource}
        title={`${series.title[locale === "zh-CN" ? "zh" : "en"]} — ${episode.title}`}
      />
      <div className="episode-details">
        <Link className="series-context" href={`/${locale}`}>
          <span aria-hidden="true">←</span> {dictionary.backToSeries}:{" "}
          {series.title[locale === "zh-CN" ? "zh" : "en"]}
        </Link>
        <div className="episode-heading">
          <p className="episode-kicker">
            {locale === "zh-CN"
              ? `第 ${episode.number} 集`
              : `Episode ${episode.number}`}
          </p>
          <h1 id="episode-title">
            {locale === "zh-CN" ? `第 ${episode.number} 集` : episode.title}
          </h1>
        </div>
        <p className="episode-description">
          {series.description[locale === "zh-CN" ? "zh" : "en"]}
        </p>
      </div>

      <nav className="episode-navigation" aria-label={dictionary.episode}>
        {previousEpisode ? (
          <Link
            href={`/${locale}/series/${series.slug}/episode/${previousEpisode.number}`}
            rel="prev"
          >
            <span>{dictionary.previousEpisode}</span>
            <strong>
              {locale === "zh-CN"
                ? `第 ${previousEpisode.number} 集`
                : `Episode ${previousEpisode.number}`}
            </strong>
          </Link>
        ) : <span />}
        {nextEpisode ? (
          <Link
            href={`/${locale}/series/${series.slug}/episode/${nextEpisode.number}`}
            rel="next"
          >
            <span>{dictionary.nextEpisode}</span>
            <strong>
              {locale === "zh-CN"
                ? `第 ${nextEpisode.number} 集`
                : `Episode ${nextEpisode.number}`}{" "}
              <span aria-hidden="true">→</span>
            </strong>
          </Link>
        ) : <span />}
      </nav>
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
