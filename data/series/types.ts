export type EpisodeVideoSource = {
  /** Public Douyin video ID used to construct the official iframe player URL. */
  videoId: string;
  /** Optional dimensions used to size the embedded player. */
  videoWidth?: number;
  videoHeight?: number;
};

export type LocalizedText = {
  en: string;
  zh: string;
};

/** Episode numbers as viewers see them within the season, inclusive. */
export type EpisodeRange = {
  from: number;
  to: number;
};

/**
 * Episodes are numbered automatically within each season, in list order. URLs
 * are derived from that numbering: "9", "9-part-1", "s2-e1", "1-10", "s1-full",
 * "special-1".
 */
type EpisodeBase = EpisodeVideoSource & {
  /** Defaults to 1. Season labels only appear when a series has several. */
  season?: number;
  /** Leave out instead of writing "Episode N"; the UI derives that label. */
  title?: LocalizedText;
  /** Replaces the derived label, e.g. "Finale". Does not affect numbering. */
  label?: LocalizedText;
  /** Replaces the derived URL segment. Lowercase letters, digits and "-". */
  slug?: string;
  description?: LocalizedText;
  thumbnail?: string;
  previewUrl?: string;
};

export type Episode = EpisodeBase &
  (
    | {
        kind?: "episode";
        /** Sets this episode's number; following episodes continue from it. */
        episode?: number;
        /** Split episode part. A later part without `episode` shares the previous number. */
        part?: number;
        /** The video opens with a recap of these episodes. */
        recapOf?: EpisodeRange;
        /** When the new content starts, for example "3:20". */
        newContentAt?: string;
      }
    | {
        /** Side story or variety special (番外); unnumbered but kept in previous/next. */
        kind: "special";
      }
    | {
        /** Re-cut of earlier episodes; skipped by previous/next and numbering. */
        kind: "compilation";
        /** Leave out when the compilation covers the whole season. */
        covers?: EpisodeRange;
      }
  );

export type SeriesTag =
  | "action"
  | "apocalypse"
  | "body-swap"
  | "comedy"
  | "coming-of-age"
  | "drama"
  | "fantasy"
  | "idol"
  | "music"
  | "rebirth"
  | "revenge"
  | "sci-fi"
  | "workplace";

export type Season = {
  number: number;
  title?: LocalizedText;
};

export type Series = {
  /** Stable URL segment, for example "the-last-human". */
  slug: string;
  title: LocalizedText;
  description: LocalizedText;
  tags?: SeriesTag[];
  thumbnail?: string;
  /** Optional season titles; seasons themselves come from episode.season. */
  seasons?: Season[];
  episodes: Episode[];
};
