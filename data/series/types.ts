export type EpisodeVideoSource = {
  /** Public Douyin video ID used to construct the official iframe player URL. */
  videoId: string;
  /** Optional dimensions used to size the embedded player. */
  videoWidth?: number;
  videoHeight?: number;
};

export type Episode = {
  number: number;
  title: string;
  thumbnail?: string;
  videoId: string;
  videoWidth?: number;
  videoHeight?: number;
  previewUrl?: string;
};

export type LocalizedText = {
  en: string;
  zh: string;
};

export type Series = {
  /** Stable URL segment, for example "the-last-human". */
  slug: string;
  title: LocalizedText;
  description: LocalizedText;
  thumbnail?: string;
  episodes: Episode[];
};
