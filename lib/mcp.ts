import { createMcpHandler, McpServer, type CallToolResult } from "@modelcontextprotocol/server";
import * as z from "zod";
import { seriesCatalog } from "@/data/series";
import { findEpisode, getAdjacentEpisodes, recapNote } from "@/lib/episodes";
import type { Locale } from "@/lib/i18n";
import { buildSearchIndex } from "@/lib/search-index";
import { siteUrl } from "@/lib/site-url";
import {
  parseEpisodeReference,
  searchCatalog,
  type SearchIndexEpisode,
  type SearchIndexSeries,
  type SearchLanguage,
} from "@/lib/search";
import { version } from "@/package.json";

/*
 * A read-only MCP server over the catalogue, so AI assistants can help viewers
 * find a series and hand them a link to the right episode. Playback stays on
 * the site: tools return data and watch-page URLs, never players.
 */

// The catalogue is static, so build lookups once rather than per request.
const index = buildSearchIndex();
const indexBySlug = new Map(index.series.map((series) => [series.slug, series]));
const catalogBySlug = new Map(seriesCatalog.map((series) => [series.slug, series]));

const localizedText = z.object({ en: z.string(), zh: z.string() });

const episodeSummary = z.object({
  slug: z.string().describe('Episode URL segment, e.g. "4", "s2-e1" or "special-1".'),
  kind: z.enum(["episode", "special", "compilation"]),
  season: z.number().int(),
  number: z.number().int().optional().describe("Absent for specials and compilations."),
  label: localizedText.describe('Positional label, e.g. "Episode 4".'),
  title: localizedText.optional(),
  url: z.url().describe("Watch page for this episode."),
});

const seriesSummary = z.object({
  slug: z.string(),
  title: localizedText,
  description: localizedText,
  tags: z.array(localizedText),
  episodeCount: z.number().int(),
  url: z.url().describe("Watch page for the series' first episode."),
});

const seriesReference = seriesSummary.pick({ slug: true, title: true });

const langInput = z
  .enum(["en", "zh"])
  .default("en")
  .describe("Language of the watch-page links and labels. Titles always come in both.");

const seriesSlugInput = z
  .enum(index.series.map((series) => series.slug))
  .describe("Series slug, as returned by list_series or search_catalog.");

const readOnly = { readOnlyHint: true, openWorldHint: false };

type EpisodeSummary = z.infer<typeof episodeSummary>;
type SeriesSummary = z.infer<typeof seriesSummary>;

const locales: Record<SearchLanguage, Locale> = { en: "en", zh: "zh-CN" };

function result<T extends Record<string, unknown>>(output: T): CallToolResult {
  return { content: [{ type: "text", text: JSON.stringify(output) }], structuredContent: output };
}

function toolError(text: string): CallToolResult {
  return { content: [{ type: "text", text }], isError: true };
}

/** Finds an episode by URL segment, or by a reference such as "ep 4" or "第4集". */
function resolveEpisodeSlug(series: SearchIndexSeries, input: string) {
  const exact = series.episodes.find((episode) => episode.slug === input.trim().toLowerCase());
  if (exact) return exact;

  const reference = parseEpisodeReference(input);
  if (!reference || reference.rest.trim()) return undefined;
  return series.episodes.find(
    (episode) =>
      episode.number === reference.episode && episode.season === (reference.season ?? 1),
  );
}

function watchUrl(lang: SearchLanguage, seriesSlug: string, episodeSlug: string) {
  return new URL(`/${locales[lang]}/series/${seriesSlug}/episode/${episodeSlug}`, siteUrl).href;
}

function toEpisode(
  series: SearchIndexSeries,
  episode: SearchIndexEpisode,
  lang: SearchLanguage,
): EpisodeSummary {
  return {
    slug: episode.slug,
    kind: episode.kind,
    season: episode.season,
    number: episode.number,
    label: episode.label,
    title: episode.title,
    url: watchUrl(lang, series.slug, episode.slug),
  };
}

function toSeries(series: SearchIndexSeries, lang: SearchLanguage): SeriesSummary {
  return {
    slug: series.slug,
    title: series.title,
    description: series.description,
    tags: series.tags,
    episodeCount: series.episodeCount,
    url: watchUrl(lang, series.slug, series.entryEpisode),
  };
}

function createCatalogServer() {
  const server = new McpServer(
    { name: "reelbound", title: "Reelbound", version },
    {
      instructions:
        "Reelbound is a small, curated catalogue of AI-generated short-drama series, each " +
        "a sequence of episodes. Use these tools to recommend series, answer questions " +
        "about them and find specific episodes. Every series and episode has a `url` to " +
        "its watch page: share it so the viewer can start watching. Titles are bilingual " +
        "(English and Chinese); reply in the viewer's language.",
    },
  );

  server.registerTool(
    "list_series",
    {
      title: "List series",
      description:
        "List every series in the catalogue with its synopsis, genre tags and episode count. " +
        "The catalogue is small, so use this to recommend series by mood, genre or similarity.",
      inputSchema: z.object({ lang: langInput }),
      outputSchema: z.object({ series: z.array(seriesSummary) }),
      annotations: readOnly,
    },
    async ({ lang }) => result({ series: index.series.map((series) => toSeries(series, lang)) }),
  );

  server.registerTool(
    "search_catalog",
    {
      title: "Search catalogue",
      description:
        "Search series and episodes by title, tag or description, in English or Chinese. " +
        'Understands episode references such as "nova 12" or "第3集".',
      inputSchema: z.object({
        query: z.string().trim().min(1),
        lang: langInput,
        limit: z.number().int().min(1).max(25).default(8).describe("Maximum episode results."),
      }),
      outputSchema: z.object({
        series: z.array(seriesSummary),
        episodes: z.array(z.object({ series: seriesReference, episode: episodeSummary })),
      }),
      annotations: readOnly,
    },
    async ({ query, lang, limit }) => {
      const results = searchCatalog(index, query, { episodeLimit: limit });
      return result({
        series: results.series.map((hit) => toSeries(hit.series, lang)),
        episodes: results.episodes.map((hit) => ({
          series: { slug: hit.series.slug, title: hit.series.title },
          episode: toEpisode(hit.series, hit.episode, lang),
        })),
      });
    },
  );

  server.registerTool(
    "get_series",
    {
      title: "Get series",
      description:
        "Get a series with its full episode list in viewing order, including specials " +
        "and compilations.",
      inputSchema: z.object({ series: seriesSlugInput, lang: langInput }),
      outputSchema: seriesSummary.extend({
        seasons: z
          .array(z.object({ number: z.number().int(), title: localizedText }))
          .describe("Named seasons, when the series has any."),
        episodes: z.array(episodeSummary),
      }),
      annotations: readOnly,
    },
    async ({ series: slug, lang }) => {
      const series = indexBySlug.get(slug);
      if (!series) return toolError(`Unknown series "${slug}". Call list_series for valid slugs.`);

      return result({
        ...toSeries(series, lang),
        seasons: (catalogBySlug.get(slug)?.seasons ?? []).flatMap(({ number, title }) =>
          title ? [{ number, title }] : [],
        ),
        episodes: series.episodes.map((episode) => toEpisode(series, episode, lang)),
      });
    },
  );

  server.registerTool(
    "get_episode",
    {
      title: "Get episode",
      description:
        "Get one episode's details with the previous and next episodes, to answer " +
        '"what happens in episode 4" or "what comes after this".',
      inputSchema: z.object({
        series: seriesSlugInput,
        episode: z
          .string()
          .min(1)
          .describe('Episode URL segment such as "4", "s2-e1" or "special-1", or a number like "ep 4".'),
        lang: langInput,
      }),
      outputSchema: z.object({
        series: seriesReference,
        episode: episodeSummary.extend({
          description: localizedText.optional(),
          recap: z.string().optional().describe("Set when the video opens with a recap."),
        }),
        previous: episodeSummary.optional(),
        next: episodeSummary.optional(),
      }),
      annotations: readOnly,
    },
    async ({ series: slug, episode: input, lang }) => {
      const series = indexBySlug.get(slug);
      const catalogSeries = catalogBySlug.get(slug);
      if (!series || !catalogSeries) {
        return toolError(`Unknown series "${slug}". Call list_series for valid slugs.`);
      }

      const episode = resolveEpisodeSlug(series, input);
      const resolved = episode && findEpisode(catalogSeries, episode.slug);
      if (!episode || !resolved) {
        const valid = series.episodes.map((item) => item.slug).join(", ");
        return toolError(`No episode "${input}" in "${slug}". Valid episodes: ${valid}.`);
      }

      const adjacent = getAdjacentEpisodes(catalogSeries, resolved);
      const summary = (episodeSlug?: string) => {
        const match = series.episodes.find((item) => item.slug === episodeSlug);
        return match && toEpisode(series, match, lang);
      };

      return result({
        series: { slug: series.slug, title: series.title },
        episode: {
          ...toEpisode(series, episode, lang),
          description: episode.description,
          recap: recapNote(resolved, locales[lang]) ?? undefined,
        },
        previous: summary(adjacent.previous?.slug),
        next: summary(adjacent.next?.slug),
      });
    },
  );

  return server;
}

/** Stateless Streamable HTTP handler: each request gets a fresh, cheap server. */
export const mcpHandler = createMcpHandler(createCatalogServer);
