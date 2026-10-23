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
import { DoomsdayMountainLodge } from "./series/mo-ri-shan-su";
import { BackAt100KilosIDebutAsTheCenter } from "./series/chong-hui-200-jin-wo-c-wei-chu-dao";
import { HowToBeYourOwnLittleSister } from "./series/lin-man-bu-man";
import { ArenaEarth } from "./series/kun-shou-zhi-zhan";
import { FileZero } from "./series/ling-hao-dang-an";
import { Nova } from "./series/nova";
import { OvernightStar } from "./series/yi-zhao-cheng-ming";
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
  DoomsdayMountainLodge,
  SuddenlyRichFamily,
  ANameOfHerOwn,
  FileZero,
  HowToBeYourOwnLittleSister,
  TheLongLifeInitiative,
  OvernightStar,
  ArenaEarth,
  BackAt100KilosIDebutAsTheCenter,
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
