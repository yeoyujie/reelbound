import type { LocalizedText } from "@/data/series";

/*
 * Catalogue search. Everything here is pure and runs in the browser over a
 * slim index (see lib/search-index.ts), so results update on every keystroke.
 * A future agentic search can return the same `SearchResult` shape.
 * See docs/search.md for the design.
 */

export type SearchEpisodeKind = "episode" | "special" | "compilation";

export type SearchIndexEpisode = {
  /** URL segment, e.g. "4", "s2-e1" or "special-1". */
  slug: string;
  kind: SearchEpisodeKind;
  season: number;
  /** Viewer-facing number; undefined for specials and compilations. */
  number?: number;
  /** Positional label, e.g. "Episode 4" or "全季合集". */
  label: LocalizedText;
  title?: LocalizedText;
  description?: LocalizedText;
};

export type SearchIndexSeries = {
  slug: string;
  title: LocalizedText;
  description: LocalizedText;
  tags: LocalizedText[];
  thumbnail?: string;
  episodeCount: number;
  /** Where "watch series" starts. */
  entryEpisode: string;
  episodes: SearchIndexEpisode[];
};

export type SearchIndex = {
  series: SearchIndexSeries[];
};

export type SearchLanguage = keyof LocalizedText;

/** The strongest reason a result matched, so the UI can show matching context. */
export type SearchMatch =
  | { field: "title" | "tag" | "description"; language: SearchLanguage }
  | { field: "number" | "none" };

type ResultBase = {
  score: number;
  match: SearchMatch;
  /** Why an agent picked this result. Local search leaves it out. */
  reason?: LocalizedText;
};

export type SeriesResult = ResultBase & {
  kind: "series";
  series: SearchIndexSeries;
};

export type EpisodeResult = ResultBase & {
  kind: "episode";
  series: SearchIndexSeries;
  episode: SearchIndexEpisode;
};

export type SearchResult = SeriesResult | EpisodeResult;

export type SearchResults = {
  series: SeriesResult[];
  episodes: EpisodeResult[];
};

const languages: SearchLanguage[] = ["en", "zh"];
const hanPattern = /\p{Script=Han}/u;
const wordCharacterPattern = /[\p{L}\p{N}]/u;

/**
 * Lowercases, folds full-width forms and strips accents. Each UTF-16 unit maps
 * to exactly one unit, so positions found in the result also apply to the
 * original text (used for highlighting).
 */
export function normalize(text: string) {
  return text.replace(/[\s\S]/g, (char) => {
    const folded = char.normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase();
    return folded.length === 1 ? folded : char;
  });
}

function queryTerms(query: string) {
  return [...new Set(normalize(query).trim().split(/\s+/).filter(Boolean))];
}

/** Short Latin terms would match most descriptions, so they only match names. */
function canMatchDescription(term: string) {
  return term.length >= (hanPattern.test(term) ? 2 : 3);
}

/**
 * Chinese has no spaces, so a Chinese term, or anything that follows a Chinese
 * character (the "C" in "我C位出道"), counts as the start of a word.
 */
function isWordStart(text: string, index: number, term: string) {
  if (index === 0 || hanPattern.test(term[0])) return true;
  const previous = text[index - 1];
  return hanPattern.test(previous) || !wordCharacterPattern.test(previous);
}

/**
 * 0 for no match, then 1 (inside a word), 2 (start of a word), 3 (start of the
 * text) and 4 (the whole text).
 */
function rankTerm(text: string, term: string) {
  let index = text.indexOf(term);
  let best = 0;

  while (index !== -1 && best < 2) {
    best = Math.max(best, isWordStart(text, index, term) ? 2 : term.length >= 3 ? 1 : 0);
    index = text.indexOf(term, index + 1);
  }

  if (best === 0) return 0;
  if (text === term) return 4;
  if (text.startsWith(term)) return 3;
  return best;
}

const titleWeights = [0, 30, 60, 80, 100];
const tagWeights = [0, 0, 30, 35, 40];
const descriptionWeight = 10;

type FieldMatch = { score: number; match: SearchMatch };

const noMatch: FieldMatch = { score: 0, match: { field: "none" } };

function better(a: FieldMatch, b: FieldMatch) {
  return b.score > a.score ? b : a;
}

function matchTitle(title: LocalizedText | undefined, term: string, weight = 1): FieldMatch {
  let best = noMatch;
  if (!title) return best;

  for (const language of languages) {
    const score = titleWeights[rankTerm(normalize(title[language]), term)] * weight;
    best = better(best, { score, match: { field: "title", language } });
  }

  return best;
}

function matchTags(tags: LocalizedText[], term: string): FieldMatch {
  let best = noMatch;

  for (const tag of tags) {
    for (const language of languages) {
      const score = tagWeights[rankTerm(normalize(tag[language]), term)];
      best = better(best, { score, match: { field: "tag", language } });
    }
  }

  return best;
}

function matchDescription(description: LocalizedText | undefined, term: string): FieldMatch {
  let best = noMatch;
  if (!description || !canMatchDescription(term)) return best;

  for (const language of languages) {
    if (normalize(description[language]).includes(term)) {
      best = better(best, {
        score: descriptionWeight,
        match: { field: "description", language },
      });
    }
  }

  return best;
}

function matchSeriesTerm(series: SearchIndexSeries, term: string, withDescription = true) {
  const named = better(matchTitle(series.title, term), matchTags(series.tags, term));
  return withDescription ? better(named, matchDescription(series.description, term)) : named;
}

/**
 * Every term has to match somewhere. The result keeps the match from the
 * highest-scoring term, which is what the UI explains.
 */
function matchAllTerms(terms: string[], matchTerm: (term: string) => FieldMatch) {
  let total = 0;
  let strongest = noMatch;

  for (const term of terms) {
    const result = matchTerm(term);
    if (result.score === 0) return noMatch;
    total += result.score;
    strongest = better(strongest, result);
  }

  return { score: total, match: strongest.match };
}

/** Bonus when the whole query is the title or the start of it, e.g. "the age of". */
function wholeTitleBonus(title: LocalizedText, query: string) {
  let bonus = 0;

  for (const language of languages) {
    const text = normalize(title[language]);
    if (text === query) bonus = Math.max(bonus, 50);
    else if (text.startsWith(query)) bonus = Math.max(bonus, 20);
  }

  return bonus;
}

const chineseDigits: Record<string, number> = {
  零: 0,
  一: 1,
  二: 2,
  两: 2,
  三: 3,
  四: 4,
  五: 5,
  六: 6,
  七: 7,
  八: 8,
  九: 9,
};

/** Parses "12", "十二", "二十" or "一百零五". Returns NaN for anything else. */
export function parseNumber(text: string) {
  if (/^\d+$/.test(text)) return Number(text);

  let total = 0;
  let current = 0;

  for (const char of text) {
    if (char in chineseDigits) {
      current = chineseDigits[char];
    } else if (char === "十" || char === "百") {
      total += (current || 1) * (char === "十" ? 10 : 100);
      current = 0;
    } else {
      return Number.NaN;
    }
  }

  return text ? total + current : Number.NaN;
}

export type EpisodeReference = {
  episode: number;
  season?: number;
  /** The query with the episode reference removed, e.g. "nova" from "nova 12". */
  rest: string;
};

const numeral = "[\\d零一二两三四五六七八九十百]+";
const seasonAndEpisodePattern = /(?:^|\s)s\s*(\d+)\s*e(?:p(?:isode)?)?\s*(\d+)(?=\s|$)/;
const chineseSeasonPattern = new RegExp(`第\\s*(${numeral})\\s*季`);
const chineseEpisodePattern = new RegExp(`第?\\s*(${numeral})\\s*集`);
const englishSeasonPattern = /(?:^|\s)season\s*(\d+)(?=\s|$)/;
const englishEpisodePattern = /(?:^|\s)(?:ep(?:isode)?|e)\s*\.?\s*(\d+)(?=\s|$)/;
const trailingNumberPattern = /(?:^|\s)(\d+)$/;

/**
 * Finds an episode in the query: "nova 12", "nova ep 12", "s2e3",
 * "season 2 episode 3", "第12集" or "第二季第三集".
 */
export function parseEpisodeReference(query: string): EpisodeReference | null {
  let rest = normalize(query).trim();
  let season: number | undefined;
  let episode: number | undefined;

  const take = (pattern: RegExp) => {
    const found = rest.match(pattern);
    if (!found) return undefined;
    rest = `${rest.slice(0, found.index)} ${rest.slice(found.index! + found[0].length)}`;
    return found;
  };

  const both = take(seasonAndEpisodePattern);
  if (both) {
    season = Number(both[1]);
    episode = Number(both[2]);
  } else {
    const seasonMatch = take(chineseSeasonPattern) ?? take(englishSeasonPattern);
    if (seasonMatch) season = parseNumber(seasonMatch[1]);

    const episodeMatch =
      take(chineseEpisodePattern) ?? take(englishEpisodePattern) ?? take(trailingNumberPattern);
    if (episodeMatch) episode = parseNumber(episodeMatch[1]);
  }

  if (episode === undefined || Number.isNaN(episode)) return null;

  return {
    episode,
    season: season === undefined || Number.isNaN(season) ? undefined : season,
    rest: rest.replace(/\s+/g, " ").trim(),
  };
}

const compilationWeight = 0.5;
/** How much a matching series title adds to an episode matched by its own text. */
const seriesContextWeight = 0.3;

function scoreEpisode(series: SearchIndexSeries, episode: SearchIndexEpisode, terms: string[]) {
  let total = 0;
  let strongest = noMatch;
  let matchedOwnText = false;

  for (const term of terms) {
    const own = better(matchTitle(episode.title, term, 0.9), matchDescription(episode.description, term));
    const context = matchSeriesTerm(series, term, false);

    if (own.score === 0 && context.score === 0) return noMatch;
    if (own.score > 0) matchedOwnText = true;

    total += own.score + context.score * seriesContextWeight;
    strongest = better(strongest, own);
  }

  // Without this, "nova" would list every Nova episode under the series itself.
  return matchedOwnText ? { score: total, match: strongest.match } : noMatch;
}

/** Adds an episode result, keeping the higher score when it was already found. */
function addEpisodeResult(
  results: Map<string, EpisodeResult>,
  series: SearchIndexSeries,
  episode: SearchIndexEpisode,
  { score, match }: FieldMatch,
) {
  const weighted = episode.kind === "compilation" ? score * compilationWeight : score;
  const key = `${series.slug}/${episode.slug}`;
  const existing = results.get(key);

  if (!existing || weighted > existing.score) {
    results.set(key, { kind: "episode", series, episode, score: weighted, match });
  }
}

/**
 * How strongly a series' episodes match an episode reference. A bare "12"
 * matches episode 12 everywhere, but well below "nova 12".
 */
function scoreReference(series: SearchIndexSeries, restTerms: string[]) {
  if (restTerms.length === 0) return 40;
  const named = matchAllTerms(restTerms, (term) => matchSeriesTerm(series, term, false));
  return named.score > 0 ? 150 + named.score : 0;
}

function compareResults(a: SearchResult, b: SearchResult) {
  const compilationLast = (result: SearchResult) =>
    result.kind === "episode" && result.episode.kind === "compilation" ? 1 : 0;
  return b.score - a.score || compilationLast(a) - compilationLast(b);
}

export type SearchOptions = {
  /** At most this many episode results; series results are never capped. */
  episodeLimit?: number;
};

/**
 * Searches series and episodes in both languages. An empty query lists every
 * series in catalogue order. Ties keep catalogue order.
 */
export function searchCatalog(
  index: SearchIndex,
  query: string,
  { episodeLimit = 8 }: SearchOptions = {},
): SearchResults {
  const terms = queryTerms(query);

  if (terms.length === 0) {
    return {
      series: index.series.map((series) => ({
        kind: "series",
        series,
        score: 0,
        match: { field: "none" },
      })),
      episodes: [],
    };
  }

  const fullQuery = terms.join(" ");
  const reference = parseEpisodeReference(query);
  const referenceTerms = reference ? queryTerms(reference.rest) : [];
  const seriesResults: SeriesResult[] = [];
  const episodeResults = new Map<string, EpisodeResult>();

  for (const series of index.series) {
    let seriesMatch = matchAllTerms(terms, (term) => matchSeriesTerm(series, term));

    // "nova 12" should still show Nova, matched by what's left of the query.
    if (reference && referenceTerms.length > 0) {
      seriesMatch = better(
        seriesMatch,
        matchAllTerms(referenceTerms, (term) => matchSeriesTerm(series, term)),
      );
    }

    if (seriesMatch.score > 0) {
      seriesResults.push({
        kind: "series",
        series,
        score: seriesMatch.score + wholeTitleBonus(series.title, fullQuery),
        match: seriesMatch.match,
      });
    }

    const referenceScore = reference ? scoreReference(series, referenceTerms) : 0;

    for (const episode of series.episodes) {
      if (
        reference &&
        referenceScore > 0 &&
        episode.number === reference.episode &&
        (reference.season === undefined || episode.season === reference.season)
      ) {
        addEpisodeResult(episodeResults, series, episode, {
          score: referenceScore,
          match: { field: "number" },
        });
      }

      const textMatch = scoreEpisode(series, episode, terms);
      if (textMatch.score > 0) addEpisodeResult(episodeResults, series, episode, textMatch);
    }
  }

  return {
    series: seriesResults.sort(compareResults),
    episodes: [...episodeResults.values()].sort(compareResults).slice(0, episodeLimit),
  };
}

export type HighlightPart = { text: string; match: boolean };

function matchRanges(text: string, query: string) {
  const normalized = normalize(text);
  const ranges: [number, number][] = [];

  for (const term of queryTerms(query)) {
    for (let index = normalized.indexOf(term); index !== -1; index = normalized.indexOf(term, index + 1)) {
      if (isWordStart(normalized, index, term) || term.length >= 3) {
        ranges.push([index, index + term.length]);
      }
    }
  }

  ranges.sort((a, b) => a[0] - b[0]);

  const merged: [number, number][] = [];
  for (const range of ranges) {
    const last = merged.at(-1);
    if (last && range[0] <= last[1]) last[1] = Math.max(last[1], range[1]);
    else merged.push([...range]);
  }

  return merged;
}

/** Splits `text` into matched and unmatched parts for rendering with <mark>. */
export function highlight(text: string, query: string): HighlightPart[] {
  const parts: HighlightPart[] = [];
  let cursor = 0;

  for (const [start, end] of matchRanges(text, query)) {
    if (start > cursor) parts.push({ text: text.slice(cursor, start), match: false });
    parts.push({ text: text.slice(start, end), match: true });
    cursor = end;
  }

  if (cursor < text.length) parts.push({ text: text.slice(cursor), match: false });
  return parts;
}

/**
 * A short excerpt for results matched by description. It starts just before
 * the first match, so the match stays visible when the line is truncated.
 */
export function snippet(text: string, query: string, length = 80) {
  const first = matchRanges(text, query)[0];
  if (!first) return text.length > length ? `${text.slice(0, length).trimEnd()}…` : text;

  const start = Math.max(0, first[0] - 12);
  const end = Math.min(text.length, Math.max(start + length, first[1]));
  return `${start > 0 ? "…" : ""}${text.slice(start, end).trim()}${end < text.length ? "…" : ""}`;
}
