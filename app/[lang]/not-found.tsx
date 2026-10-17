import type { Metadata } from "next";
import { NotFoundScene, type NotFoundPick } from "@/components/not-found-scene";
import { seriesCatalog } from "@/data/series";
import { getEntryEpisode } from "@/lib/episodes";
import { tagLabels } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "404",
};

export default function NotFound() {
  const picks = seriesCatalog.flatMap((series): NotFoundPick[] => {
    const entry = getEntryEpisode(series);
    return entry
      ? [
          {
            path: `/series/${series.slug}/episode/${entry.slug}`,
            title: series.title,
            tags: (series.tags ?? []).slice(0, 2).map((tag) => tagLabels[tag]),
            episodeCount: series.episodes.length,
            thumbnail: series.thumbnail,
          },
        ]
      : [];
  });

  return (
    <main className="not-found-shell">
      <NotFoundScene picks={picks} />
    </main>
  );
}
