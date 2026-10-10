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

export type Series = {
  /** Stable URL segment, for example "the-last-human". */
  slug: string;
  title: string;
  description: string;
  thumbnail?: string;
  episodes: Episode[];
};

/**
 * Curated series rendered by the site. Add catalogue entries here as they are
 * ready; keep episode numbers ordered and use public paths for local artwork.
 */
export const seriesCatalog: Series[] = [
  {
    slug: "suddenly-rich-family",
    title: "暴富一家人",
    description: "Rich overnight, broke on common sense! An everyday family gets a magical 'rich system' and spends their way through one hilarious disaster after another. Money can't buy brains — but it sure buys laughs.",
    episodes: [
      { number: 1, title: "Episode 1", videoId: "7649219887503559963" },
      { number: 2, title: "Episode 2", videoId: "7649711555487071161" },
      { number: 3, title: "Episode 3", videoId: "7650435021795815802" },
      { number: 4, title: "Episode 4", videoId: "7651566208898072805" },
      { number: 5, title: "Episode 5", videoId: "7652208895591918321" },
      { number: 6, title: "Episode 6", videoId: "7653006429381683429" },
      { number: 7, title: "Episode 7", videoId: "7653684149602120049" },
      { number: 8, title: "Episode 8", videoId: "7654523794934369649" },
      { number: 9, title: "Episode 9", videoId: "7655256072756327035" },
      { number: 10, title: "Episode 10", videoId: "7656689482044894586" },
      { number: 11, title: "Episode 11", videoId: "7657467168565667045" },
      { number: 12, title: "Episode 12", videoId: "7658192017696239717" },
      { number: 13, title: "Episode 13", videoId: "7659338264423690341" },
      { number: 14, title: "Episode 14", videoId: "7660104129063257253" },
      { number: 15, title: "Episode 15", videoId: "7661950544122084581" },
      { number: 16, title: "Episode 16", videoId: "7662678104872408571" },
      { number: 17, title: "Episode 17", videoId: "7663428380666294181" },
      { number: 18, title: "Episode 18", videoId: "7664550095077480625" },
      { number: 19, title: "Episode 19", videoId: "7665277046775531749" },
      { number: 20, title: "Episode 20", videoId: "7666060222133831845" },
      { number: 21, title: "Episode 21", videoId: "7667511660123260069" },
      { number: 22, title: "Episode 22", videoId: "7668250188444220657" },
      { number: 23, title: "Episode 23", videoId: "7668621699931587579" },
      { number: 24, title: "Episode 24", videoId: "7670113286378126769" },
      { number: 25, title: "Episode 25", videoId: "7670846857971292517" },
      { number: 26, title: "Episode 26", videoId: "7671564774194582757" },
      { number: 27, title: "Episode 27", videoId: "7672328416959524069" },
      { number: 28, title: "Episode 28", videoId: "7673071724355873529" },
      { number: 29, title: "Episode 29", videoId: "7673848093419480165" },
      { number: 30, title: "Episode 30", videoId: "7674927855541286393" },
      { number: 31, title: "Episode 31", videoId: "7676410638407258277" },
      { number: 32, title: "Episode 32", videoId: "7677150455026254073" },
      { number: 33, title: "Episode 33", videoId: "7677882371807549541" },
      { number: 34, title: "Episode 34", videoId: "7678637090837764837" },
      { number: 35, title: "Episode 35", videoId: "7679378661611645925" },
      { number: 36, title: "Episode 36", videoId: "7680492806649402341" },
      { number: 37, title: "Episode 37", videoId: "7681235573924215994" },
      { number: 38, title: "Episode 38", videoId: "7681927695093421809" },
      { number: 39, title: "Episode 39", videoId: "7683095981102146277" },
      { number: 40, title: "Episode 40", videoId: "7684224809605495912" },
      { number: 41, title: "Episode 41", videoId: "7685691918538468261" },
      { number: 42, title: "Episode 42", videoId: "7686436175448690533" },
      { number: 43, title: "Episode 43", videoId: "7687913934301496249" },
      { number: 44, title: "Episode 44", videoId: "7689039377481323749" },
      { number: 45, title: "Episode 45", videoId: "7690892215102953829" },
    ],
  },
  {
    slug: "back-to-200-lbs-i-debut-as-center",
    title: "重回200斤我C位出道",
    description: "7 years of training in Korea. 3 minutes of center-stage glory. One ridiculous death. Then — a second chance. Follow a Chongqing girl reborn as her 200-jin teenage self, clawing her way back to the top with nothing but talent, attitude, and unfinished business. The comeback nobody saw coming — except her.",
    episodes: [
      { number: 1, title: "Episode 1", videoId: "7682364617943568870" },
      { number: 2, title: "Episode 2", videoId: "7686077962215938981" },
      { number: 3, title: "Episode 3", videoId: "7688314671787594939" },
      { number: 4, title: "Episode 4", videoId: "7691230455907244709" },
      { number: 5, title: "Episode 5", videoId: "7693855087457789157" },
    ],
  },
  {
    slug: "the-laid-off-girl",
    title: "被裁掉的女孩",
    description: "She was the first one cropped out of the photo — so she decided to become impossible to crop out. A small-town girl with a modeling dream hits the big city and learns the hard way: being pretty gets you seen, but it won't get you respected. Refusing shortcuts, refusing to 'be owned', she fights from the edge of every frame to the very center. Realistic, sharp, and quietly savage.",
    episodes: [
      { number: 1, title: "Episode 1", videoId: "7650427585301630208" },
      { number: 2, title: "Episode 2", videoId: "7650912327528746250" },
      { number: 3, title: "Episode 3", videoId: "7652270434339097899" },
      { number: 4, title: "Episode 4", videoId: "7653013332688948515" },
      { number: 5, title: "Episode 5", videoId: "7653757394333224198" },
      { number: 6, title: "Episode 6", videoId: "7654497027572682034" },
      { number: 7, title: "Episode 7", videoId: "7655194791579356450" },
      { number: 8, title: "Episode 8", videoId: "7656161931480386816" },
      { number: 9, title: "Episode 9", videoId: "7657282468180970762" },
      { number: 10, title: "Episode 10", videoId: "7658112014190939430" },
      { number: 11, title: "Episode 11", videoId: "7660274266088230180" },
      { number: 12, title: "Episode 12", videoId: "7662836605589228834" },
      { number: 13, title: "Episode 13", videoId: "7666784228712942894" },
      { number: 14, title: "Episode 14", videoId: "7668745973568408884" },
      { number: 15, title: "Episode 15", videoId: "7668973589479066914" },
      { number: 16, title: "Episode 16", videoId: "7670463070237478207" },
      { number: 17, title: "Episode 17", videoId: "7670567837211036968" },
      { number: 18, title: "Episode 18", videoId: "7671705974310194482" },
      { number: 19, title: "Episode 19", videoId: "7672054749109161235" },
      { number: 20, title: "Episode 20", videoId: "7673480999812255030" },
      { number: 21, title: "Episode 21", videoId: "7674551711079402794" },
      { number: 22, title: "Episode 22", videoId: "7675081903677967635" },
      { number: 23, title: "Episode 23", videoId: "7675812554425355555" },
      { number: 24, title: "Episode 24", videoId: "7677443172443704626" },
      { number: 25, title: "Episode 25", videoId: "7679008022307409193" },
      { number: 26, title: "Episode 26", videoId: "7680541532486782223" },
      { number: 27, title: "Episode 27", videoId: "7691756458265824563" },
    ],
  },
];
