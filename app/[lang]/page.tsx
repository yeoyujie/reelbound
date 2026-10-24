import { AssistantDemo } from "@/components/assistant-demo";
import { HomeHero } from "@/components/home-hero";
import { SeriesCard } from "@/components/series-card";
import { seriesCatalog } from "@/data/series";
import { getAssistantDemos } from "@/lib/assistant-demos";
import { getEntryEpisode } from "@/lib/episodes";
import {
  firstSentence,
  getDictionary,
  isLocale,
  localeAlternates,
  localizedText,
  type Locale,
} from "@/lib/i18n";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return { alternates: localeAlternates(lang, "") };
}

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale: Locale = lang;
  const dictionary = getDictionary(locale);
  const featuredSeries = seriesCatalog[0];
  const featuredEpisode = featuredSeries && getEntryEpisode(featuredSeries);

  if (!featuredSeries || !featuredEpisode) notFound();

  const featuredDescription = firstSentence(localizedText(featuredSeries.description, locale));

  return (
    <main className="home-shell">
      <HomeHero
        actionHref={`/${locale}/series/${featuredSeries.slug}/episode/${featuredEpisode.slug}`}
        actionLabel={dictionary.heroAction}
        description={featuredDescription}
        eyebrow={dictionary.heroEyebrow}
        poster={featuredSeries.thumbnail ?? "/images/hero/story-01.jpg"}
        scrollLabel={dictionary.exploreCollection}
        title={localizedText(featuredSeries.title, locale)}
        videoLabel={dictionary.heroVideoLabel}
      />

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

      <section className="assistant-section" id="assistant" aria-labelledby="assistant-heading">
        <div className="assistant-intro">
          <p className="eyebrow">{dictionary.connectEyebrow}</p>
          <h2 id="assistant-heading">{dictionary.connectTitle}</h2>
          <p className="assistant-copy">{dictionary.connectLede}</p>
          <ul className="connect-facts">
            {dictionary.connectFacts.map((fact) => (
              <li key={fact}>{fact}</li>
            ))}
          </ul>
          <Link className="assistant-action" href={`/${locale}/connect`}>
            {dictionary.connectLink}
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <AssistantDemo
          demos={getAssistantDemos(locale)}
          labels={{
            tryAsking: dictionary.connectAskLike,
            youAsked: dictionary.assistantYouAsked,
            watch: dictionary.assistantWatch,
          }}
        />
      </section>

      <footer className="home-footer">
        <span>Reelbound</span>
        <span>{dictionary.footer}</span>
      </footer>
    </main>
  );
}
