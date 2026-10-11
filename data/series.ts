import type { Episode, EpisodeVideoSource, LocalizedText, Series } from "./series/types";

import { SuddenlyRichFamily } from "./series/bao-fu-yi-jia-ren";
import { BackTo200LbsIDebutAsCenter } from "./series/chong-hui-200-jin-wo-c-wei-chu-dao";
import { TheLaidOffGirl } from "./series/bei-cai-diao-de-nv-hai";
import { Guixu } from "./series/gui-xu";
import { Nova } from "./series/nova";

/**
 * Ordered series catalogue. Move entries here to change their homepage order.
 * Each series' content lives in its own file under data/series/.
 */
export const seriesCatalog: Series[] = [
  TheLaidOffGirl,
  Guixu,
  Nova,
  SuddenlyRichFamily,
  BackTo200LbsIDebutAsCenter,
];

export type { Episode, EpisodeVideoSource, LocalizedText, Series };
