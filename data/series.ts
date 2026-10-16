import type {
  Episode,
  EpisodeRange,
  EpisodeVideoSource,
  LocalizedText,
  Season,
  Series,
  SeriesTag,
} from "./series/types";

import { ANameOfHerOwn } from "./series/wo-jiao-xu-ai-li";
import { BackAt100KilosIDebutAsTheCenter } from "./series/chong-hui-200-jin-wo-c-wei-chu-dao";
import { HowToBeYourOwnLittleSister } from "./series/lin-man-bu-man";
import { Nova } from "./series/nova";
import { SuddenlyRichFamily } from "./series/bao-fu-yi-jia-ren";
import { TheAgeOfNewSpecies } from "./series/gui-xu";
import { TheLaidOffGirl } from "./series/bei-cai-diao-de-nv-hai";
import { TheLongLifeInitiative } from "./series/mi-shou-ji-hua";

/**
 * Ordered series catalogue. Move entries here to change their homepage order.
 * Each series' content lives in its own file under data/series/.
 */
export const seriesCatalog: Series[] = [
  TheLaidOffGirl,
  TheAgeOfNewSpecies,
  Nova,
  SuddenlyRichFamily,
  ANameOfHerOwn,
  HowToBeYourOwnLittleSister,
  BackAt100KilosIDebutAsTheCenter,
  TheLongLifeInitiative,
];

export type {
  Episode,
  EpisodeRange,
  EpisodeVideoSource,
  LocalizedText,
  Season,
  Series,
  SeriesTag,
};
