import { SeriesCard } from "@/components/series-card";
import { seriesCatalog } from "@/data/series";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { notFound } from "next/navigation";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale: Locale = lang;
  const dictionary = getDictionary(locale);

  return (
    <main className="home-shell">
      <section className="intro" aria-labelledby="intro-title">
        <p className="eyebrow">{dictionary.introEyebrow}</p>
        <h1 id="intro-title">
          {dictionary.introTitle[0]}
          <br />
          {dictionary.introTitle[1]}
        </h1>
        <p className="intro-copy">{dictionary.introCopy}</p>
        <a className="intro-link" href="#series">
          {dictionary.exploreCollection} <span aria-hidden="true">↓</span>
        </a>
      </section>

      <section className="series-section" id="series" aria-labelledby="series-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{dictionary.collection}</p>
            <h2 id="series-heading">{dictionary.seriesHeading}</h2>
          </div>
          <span className="series-total">
            {String(seriesCatalog.length).padStart(2, "0")} {dictionary.seriesCount}
          </span>
        </div>

        {seriesCatalog.length > 0 ? (
          <div className="series-grid">
            {seriesCatalog.map((series) => (
              <SeriesCard
                key={series.slug}
                series={series}
                locale={locale}
                dictionary={dictionary}
              />
            ))}
          </div>
        ) : (
          <p className="empty-catalogue">{dictionary.emptyCatalogue}</p>
        )}
      </section>

      <footer className="home-footer">
        <span>NextFrame</span>
        <span>{dictionary.footer}</span>
      </footer>
    </main>
  );
}
