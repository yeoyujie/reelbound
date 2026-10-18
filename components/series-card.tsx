import Image from "next/image";
import Link from "next/link";
import type { Series } from "@/data/series";
import { getEntryEpisode } from "@/lib/episodes";
import { localizedText, tagList, type Dictionary, type Locale } from "@/lib/i18n";

type SeriesCardProps = {
  series: Series;
  locale: Locale;
  dictionary: Dictionary;
};

export function SeriesCard({ series, locale, dictionary }: SeriesCardProps) {
  const firstEpisode = getEntryEpisode(series);
  const title = localizedText(series.title, locale);
  const description = localizedText(series.description, locale);
  const tags = tagList(series.tags, locale);
  const episodeCount = `${series.episodes.length}\u00a0${dictionary.episodes}`;

  if (!firstEpisode) return null;

  return (
    <Link
      className="series-card"
      href={`/${locale}/series/${series.slug}/episode/${firstEpisode.slug}`}
      aria-label={`${dictionary.watchSeries}: ${title}`}
    >
      <div className="series-card-surface">
        <div className="series-artwork" aria-hidden="true">
          <div className="series-artwork-frame">
            {series.thumbnail ? (
              <Image
                src={series.thumbnail}
                alt=""
                fill
                sizes="(max-width: 600px) 50vw, (max-width: 1000px) 33vw, 460px"
              />
            ) : (
              <div className="series-artwork-fallback">
                <span className="artwork-kicker">{dictionary.seriesLabel}</span>
                <span className="artwork-title">{title}</span>
                <span className="artwork-count">{episodeCount}</span>
              </div>
            )}
            {series.thumbnail && <span className="series-artwork-count">{episodeCount}</span>}
          </div>
          <div className="series-card-details">
            <span className="series-card-play">
              <span className="series-card-play-icon">
                <svg viewBox="0 0 16 16">
                  <path d="M5 3.5v9l7.5-4.5z" />
                </svg>
              </span>
              {dictionary.watchSeries}
            </span>
            <strong className="series-card-details-title">{title}</strong>
            {tags.length > 0 && <span className="series-card-tags">{tags.join(" · ")}</span>}
            <span className="series-card-synopsis">{description}</span>
          </div>
        </div>
        <div className="series-card-copy">
          <h3>{title}</h3>
          {tags.length > 0 && <p className="series-card-tags">{tags.join(" · ")}</p>}
        </div>
      </div>
    </Link>
  );
}
