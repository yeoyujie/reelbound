import { notFound } from "next/navigation";
import { seriesCatalog } from "@/data/series";
import { getDictionary, isLocale, locales } from "@/lib/i18n";
import { renderSiteCard, shareCardContentType, shareCardSize } from "@/lib/share-card";

// Image routes don't inherit the layout's static params, so prerender them here.
export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const alt = "Reelbound — curated AI short series";
export const size = shareCardSize;
export const contentType = shareCardContentType;

export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dictionary = getDictionary(lang);

  return renderSiteCard({
    eyebrow: dictionary.headerDescriptor,
    tagline: dictionary.seriesHeading,
    // Follows the homepage order, so the card changes with the catalogue.
    posters: seriesCatalog.slice(0, 3).map((series) => series.thumbnail),
  });
}
