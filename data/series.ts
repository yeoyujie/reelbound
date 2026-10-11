import type { Episode, EpisodeVideoSource, LocalizedText, Series } from "./series/types";

import { SuddenlyRichFamily } from "./series/suddenly-rich-family";
import { BackTo200LbsIDebutAsCenter } from "./series/back-to-200-lbs-i-debut-as-center";
import { TheLaidOffGirl } from "./series/the-laid-off-girl";

/**
 * Ordered series catalogue. Move entries here to change their homepage order.
 * Each series' content lives in its own file under data/series/.
 */
export const seriesCatalog: Series[] = [
  TheLaidOffGirl,
  SuddenlyRichFamily,
  BackTo200LbsIDebutAsCenter,
];

export type { Episode, EpisodeVideoSource, LocalizedText, Series };
