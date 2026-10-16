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

  if (!firstEpisode) return null;

  return (
    <Link
      className="series-card"
      href={`/${locale}/series/${series.slug}/episode/${firstEpisode.slug}`}
      aria-label={`${dictionary.watchSeries}: ${title}`}
    >
      <div className="series-artwork" aria-hidden="true">
        {series.thumbnail ? (
          <Image
            src={series.thumbnail}
            alt=""
            fill
            sizes="(max-width: 600px) calc(100vw - 40px), (max-width: 1000px) 30vw, 370px"
          />
        ) : (
          <div className="series-artwork-fallback">
            <span className="artwork-kicker">{dictionary.seriesLabel}</span>
            <span className="artwork-title">{title}</span>
            <span className="artwork-count">
              {series.episodes.length} {dictionary.episodes}
            </span>
          </div>
        )}
        <span className="card-play" aria-hidden="true">▶</span>
      </div>
      <div className="series-card-copy">
        <div>
          <h3>{title}</h3>
          {tags.length > 0 && <p className="series-card-tags">{tags.join(" · ")}</p>}
          <p>{description}</p>
        </div>
        <span className="series-card-action">
          {dictionary.watchSeries} <span aria-hidden="true">↗</span>
        </span>
      </div>
    </Link>
  );
}
