import type { Episode, EpisodeRange, Series } from "@/data/series";
import { localizedText, type Locale } from "@/lib/i18n";

/** An episode with its derived season, viewer-facing number and URL segment. */
export type ResolvedEpisode = {
  episode: Episode;
  season: number;
  /** Episode number within the season; undefined for compilations and specials. */
  number?: number;
  part?: number;
  slug: string;
};

const resolvedCache = new WeakMap<Series, ResolvedEpisode[]>();

/**
 * Numbers episodes within each season (previous + 1 unless `episode` resets the
 * counter) and derives URL segments such as "9", "9-part-1", "s2-e1", "1-10" or
 * "special-1".
 */
export function resolveEpisodes(series: Series): ResolvedEpisode[] {
  const cached = resolvedCache.get(series);
  if (cached) return cached;

  const counters = new Map<number, number>();
  const specialCounters = new Map<number, number>();
  const slugs = new Set<string>();

  const resolved = series.episodes.map((episode): ResolvedEpisode => {
    const season = episode.season ?? 1;
    const prefix = season === 1 ? "" : `s${season}-e`;
    let item: ResolvedEpisode;

    if (episode.kind === "compilation") {
      const slug = episode.covers
        ? `${prefix}${episode.covers.from}-${episode.covers.to}`
        : `s${season}-full`;
      item = { episode, season, slug: episode.slug ?? slug };
    } else if (episode.kind === "special") {
      const count = (specialCounters.get(season) ?? 0) + 1;
      specialCounters.set(season, count);
      const slug = `${season === 1 ? "" : `s${season}-`}special-${count}`;
      item = { episode, season, slug: episode.slug ?? slug };
    } else {
      const previous = counters.get(season) ?? 0;
      // Later parts of a split episode share the previous number.
      const number =
        episode.episode ?? (episode.part && episode.part > 1 ? previous : previous + 1);
      counters.set(season, number);

      const slug = `${prefix}${number}${episode.part ? `-part-${episode.part}` : ""}`;
      item = { episode, season, number, part: episode.part, slug: episode.slug ?? slug };
    }

    if (!/^[a-z0-9-]+$/.test(item.slug)) {
      throw new Error(`Episode slug "${item.slug}" in "${series.slug}" must use a-z, 0-9 and "-".`);
    }
    if (slugs.has(item.slug)) {
      throw new Error(
        `Duplicate episode URL "${item.slug}" in "${series.slug}". Set \`episode\`, \`part\` or \`slug\` to tell them apart.`,
      );
    }
    slugs.add(item.slug);

    return item;
  });

  resolvedCache.set(series, resolved);
  return resolved;
}

export function findEpisode(series: Series, slug: string) {
  return resolveEpisodes(series).find((item) => item.slug === slug);
}

export function isCompilation(item: ResolvedEpisode) {
  return item.episode.kind === "compilation";
}

export function hasMultipleSeasons(series: Series) {
  return new Set(resolveEpisodes(series).map((item) => item.season)).size > 1;
}

/** Regular episodes in viewing order; compilations are excluded. */
export function getStoryEpisodes(series: Series) {
  return resolveEpisodes(series).filter((item) => !isCompilation(item));
}

/** Where "watch series" starts: the first regular episode, or a lone compilation. */
export function getEntryEpisode(series: Series): ResolvedEpisode | undefined {
  return getStoryEpisodes(series)[0] ?? resolveEpisodes(series)[0];
}

export function getAdjacentEpisodes(series: Series, current: ResolvedEpisode) {
  const episodes = resolveEpisodes(series);
  const index = episodes.indexOf(current);
  const before = episodes.slice(0, index).filter((item) => !isCompilation(item));
  const after = episodes.slice(index + 1).filter((item) => !isCompilation(item));

  return {
    // A compilation already contains what came before it, so only offer moving on.
    previous: isCompilation(current) ? undefined : before.at(-1),
    next: after[0],
  };
}

export function groupBySeason(series: Series) {
  const groups = new Map<number, ResolvedEpisode[]>();

  for (const item of resolveEpisodes(series)) {
    groups.set(item.season, [...(groups.get(item.season) ?? []), item]);
  }

  return [...groups].map(([number, episodes]) => ({
    number,
    title: series.seasons?.find((season) => season.number === number)?.title,
    episodes,
  }));
}

function formatRange(range: EpisodeRange, locale: Locale) {
  const span = range.from === range.to ? `${range.from}` : `${range.from}–${range.to}`;
  if (locale === "zh-CN") return `第 ${span} 集`;
  return range.from === range.to ? `Episode ${span}` : `Episodes ${span}`;
}

export function seasonLabel(season: number, locale: Locale) {
  return locale === "zh-CN" ? `第 ${season} 季` : `Season ${season}`;
}

/** Positional label, e.g. "Episode 4", "S2 · E1", "Episode 9 · Part 1", "Special" or "Episodes 1–10 · Compilation". */
export function episodeLabel(
  series: Series,
  item: ResolvedEpisode,
  locale: Locale,
  { withinSeason = false } = {},
) {
  const { episode, season, number, part } = item;
  if (episode.label) return localizedText(episode.label, locale);

  const showSeason = hasMultipleSeasons(series) && !withinSeason;

  if (episode.kind === "compilation") {
    const zh = locale === "zh-CN";

    if (episode.covers) {
      const range = formatRange(episode.covers, locale);
      if (zh) return `${showSeason ? `第 ${season} 季 · ` : ""}${range}合集`;
      return `${showSeason ? `S${season} · ` : ""}${range} · Compilation`;
    }
    if (showSeason) return zh ? `第 ${season} 季合集` : `Season ${season} · Full season`;
    return zh ? "全季合集" : "Full season";
  }

  if (episode.kind === "special") {
    if (locale === "zh-CN") return `${showSeason ? `第 ${season} 季 · ` : ""}番外`;
    return `${showSeason ? `S${season} · ` : ""}Special`;
  }

  const base =
    locale === "zh-CN"
      ? `${showSeason ? `第 ${season} 季 · ` : ""}第 ${number} 集`
      : showSeason
        ? `S${season} · E${number}`
        : `Episode ${number}`;

  if (!part) return base;
  if (locale !== "zh-CN") return `${base} · Part ${part}`;

  // Douyin's convention for split episodes: 上/下, or 上/中/下.
  const partCount = resolveEpisodes(series).filter(
    (other) => other.season === season && other.number === number && other.part,
  ).length;
  const names = partCount === 2 ? ["上", "下"] : partCount === 3 ? ["上", "中", "下"] : [];
  return names[part - 1] ? `${base}（${names[part - 1]}）` : `${base} · 第 ${part} 部分`;
}

/** The episode's own name when it has one, otherwise its positional label. */
export function episodeTitle(
  series: Series,
  item: ResolvedEpisode,
  locale: Locale,
  options?: { withinSeason?: boolean },
) {
  return item.episode.title
    ? localizedText(item.episode.title, locale)
    : episodeLabel(series, item, locale, options);
}

/** Note for videos that open with a recap, e.g. "Opens with a recap of Episodes 1–5 · New from 3:20". */
export function recapNote({ episode }: ResolvedEpisode, locale: Locale) {
  if (episode.kind === "compilation" || episode.kind === "special" || !episode.recapOf) {
    return null;
  }

  const range = formatRange(episode.recapOf, locale);
  const recap = locale === "zh-CN" ? `开头含${range}回顾` : `Opens with a recap of ${range}`;

  if (!episode.newContentAt) return recap;

  return locale === "zh-CN"
    ? `${recap} · 正片从 ${episode.newContentAt} 开始`
    : `${recap} · New from ${episode.newContentAt}`;
}
