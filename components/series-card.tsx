import Link from "next/link";
import type { Series } from "@/data/series";
import { localizedText, type Dictionary, type Locale } from "@/lib/i18n";

type SeriesCardProps = {
  series: Series;
  locale: Locale;
  dictionary: Dictionary;
};

export function SeriesCard({ series, locale, dictionary }: SeriesCardProps) {
  const firstEpisode = series.episodes[0];
  const title = localizedText(series.title, locale);
  const description = localizedText(series.description, locale);

  if (!firstEpisode) return null;

  return (
    <Link
      className="series-card"
      href={`/${locale}/series/${series.slug}/episode/${firstEpisode.number}`}
      aria-label={`${dictionary.watchSeries}: ${title}`}
    >
      <div className="series-artwork" aria-hidden="true">
        {series.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={series.thumbnail} alt="" />
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
          <p>{description}</p>
        </div>
        <span className="series-card-action">
          {dictionary.watchSeries} <span aria-hidden="true">↗</span>
        </span>
      </div>
    </Link>
  );
}
