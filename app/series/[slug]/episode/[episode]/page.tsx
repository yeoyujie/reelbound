import { notFound } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { seriesCatalog } from "@/data/series";
import { EpisodePlayerSourceSync } from "@/components/episode-player-provider";

export function generateStaticParams() {
  return seriesCatalog.flatMap((series) =>
    series.episodes.map((episode) => ({
      slug: series.slug,
      episode: String(episode.number),
    })),
  );
}

type EpisodeRouteProps = PageProps<"/series/[slug]/episode/[episode]">;

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
  const { slug, episode: episodeParam } = await params;
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
  const videoSource = await addDouyinDimensions(episode.source);

  return (
    <>
      <EpisodePlayerSourceSync
        source={videoSource}
        title={`${series.title} — ${episode.title}`}
      />
      <div className="episode-details">
        <Link className="series-context" href="/">
          <span aria-hidden="true">←</span> {series.title}
        </Link>
        <div className="episode-heading">
          <p className="episode-kicker">Episode {episode.number}</p>
          <h1 id="episode-title">{episode.title}</h1>
        </div>
        <p className="episode-description">{series.description}</p>
      </div>

      <nav className="episode-navigation" aria-label="Episode navigation">
        {previousEpisode ? (
          <Link
            href={`/series/${series.slug}/episode/${previousEpisode.number}`}
            rel="prev"
          >
            <span>Previous episode</span>
            <strong>Episode {previousEpisode.number}</strong>
          </Link>
        ) : <span />}
        {nextEpisode ? (
          <Link
            href={`/series/${series.slug}/episode/${nextEpisode.number}`}
            rel="next"
          >
            <span>Next episode</span>
            <strong>Episode {nextEpisode.number} <span aria-hidden="true">→</span></strong>
          </Link>
        ) : <span />}
      </nav>
    </>
  );
}

async function addDouyinDimensions(
  source: Extract<(typeof seriesCatalog)[number]["episodes"][number]["source"], { provider: "douyin" }>,
) {
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
