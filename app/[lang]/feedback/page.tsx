import { FeedbackForm, type FeedbackDictionary } from "@/components/feedback-form";
import { isFeedbackType } from "@/lib/feedback";
import {
  getDictionary,
  isLocale,
  localeAlternates,
  type Dictionary,
  type Locale,
} from "@/lib/i18n";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { findFeedbackEpisode } from "./context";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/feedback">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dictionary = getDictionary(lang);

  return {
    title: dictionary.feedbackLink,
    description: dictionary.feedbackMetaDescription,
    alternates: localeAlternates(lang, "/feedback"),
    robots: { index: false, follow: true },
  };
}

export default async function FeedbackPage({
  params,
  searchParams,
}: PageProps<"/[lang]/feedback">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dictionary = getDictionary(lang);

  return (
    <main className="feedback-shell">
      <header className="feedback-intro">
        <p className="eyebrow">{dictionary.feedbackEyebrow}</p>
        <h1>{dictionary.feedbackTitle}</h1>
        <p className="feedback-lede">{dictionary.feedbackLede}</p>
      </header>

      {/* The page shell is static; only the episode and topic from the URL wait. */}
      <Suspense fallback={<FeedbackForm locale={lang} dictionary={feedbackDictionary(dictionary)} />}>
        <FeedbackFormFromQuery locale={lang} searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function FeedbackFormFromQuery({
  locale,
  searchParams,
}: {
  locale: Locale;
  searchParams: PageProps<"/[lang]/feedback">["searchParams"];
}) {
  const { type, series, episode } = await searchParams;

  return (
    <FeedbackForm
      locale={locale}
      dictionary={feedbackDictionary(getDictionary(locale))}
      initialType={isFeedbackType(type) ? type : undefined}
      episode={findFeedbackEpisode(series, episode, locale)}
    />
  );
}

/** Only the form's own strings go to the client. */
function feedbackDictionary(dictionary: Dictionary) {
  return Object.fromEntries(
    Object.entries(dictionary).filter(([key]) => key.startsWith("feedback")),
  ) as FeedbackDictionary;
}
