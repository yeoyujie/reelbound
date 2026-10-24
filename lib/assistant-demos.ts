import { seriesCatalog } from "@/data/series";
import { episodeLabel, findEpisode, getEntryEpisode } from "@/lib/episodes";
import {
  firstSentence,
  getDictionary,
  localizedText,
  tagList,
  type Locale,
} from "@/lib/i18n";

/** One question and the catalogue result an assistant gets back through the MCP server. */
export type AssistantDemo = {
  label: string;
  prompt: string;
  tool: string;
  title: string;
  meta: string;
  description: string;
  artwork?: string;
  href: string;
};

// In the same order as the dictionary's connectPrompts and assistantDemoLabels.
const answers = [
  { tool: "search_catalog", series: "yi-zhao-cheng-ming" },
  { tool: "search_catalog", series: "kun-shou-zhi-zhan" },
  { tool: "get_episode", series: "nova", episode: "4" },
] as const;

/**
 * The homepage's example exchanges, answered from the real catalogue. An answer
 * whose series or episode has left the catalogue is dropped rather than faked.
 */
export function getAssistantDemos(locale: Locale): AssistantDemo[] {
  const dictionary = getDictionary(locale);

  return answers.flatMap((answer, index) => {
    const series = seriesCatalog.find(({ slug }) => slug === answer.series);
    const item =
      series && ("episode" in answer ? findEpisode(series, answer.episode) : getEntryEpisode(series));
    if (!series || !item) return [];

    const meta =
      "episode" in answer
        ? [episodeLabel(series, item, locale), item.episode.title && localizedText(item.episode.title, locale)]
        : [...tagList(series.tags, locale), `${series.episodes.length} ${dictionary.episodes}`];

    return {
      label: dictionary.assistantDemoLabels[index],
      prompt: dictionary.connectPrompts[index],
      tool: answer.tool,
      title: localizedText(series.title, locale),
      meta: meta.filter(Boolean).join(" · "),
      description: firstSentence(
        localizedText(item.episode.description ?? series.description, locale),
      ),
      artwork: item.episode.thumbnail ?? series.thumbnail,
      href: `/${locale}/series/${series.slug}/episode/${item.slug}`,
    };
  });
}
