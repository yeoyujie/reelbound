import type { LocalizedText, SeriesTag } from "@/data/series";

export const locales = ["en", "zh-CN"] as const;
export type Locale = (typeof locales)[number];

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function localizedText(text: LocalizedText, locale: Locale) {
  return text[locale === "zh-CN" ? "zh" : "en"];
}

export const dictionaries = {
  en: {
    languageName: "English",
    switchLanguage: "中文",
    headerDescriptor: "Curated short series",
    home: "Reelbound home",
    switchToLightMode: "Switch to light mode",
    switchToDarkMode: "Switch to dark mode",
    introEyebrow: "Curated AI series from Douyin",
    introTitle: ["Start with one story.", "Stay for the next episode."],
    introCopy:
      "A curated selection of AI-generated Chinese series. Stories with the tension, feeling, and momentum to earn your next episode.",
    exploreCollection: "Explore the collection",
    heroEyebrow: "Reelbound pick",
    heroAction: "Watch episode 1",
    heroVideoLabel: "Atmospheric preview for the featured series",
    collection: "Curated collection",
    seriesHeading: "Stories worth your time",
    seriesCount: "series",
    seriesLabel: "Reelbound · Series",
    episodes: "episodes",
    watchSeries: "Watch series",
    emptyCatalogue: "The first series is being curated.",
    footer: "A considered selection of stories, chosen to stay with you.",
    episode: "Episode",
    nowPlaying: "Now playing",
    recapBadge: "Recap",
    previousEpisode: "Previous episode",
    nextEpisode: "Next episode",
    series: "Series",
    backToSeries: "Back to series",
    notFoundEyebrow: "Error 404 · Scene missing",
    notFoundTitle: "This scene didn't make the final cut.",
    notFoundCopy:
      "The page you're looking for was never filmed, or it was moved in the edit. The rest of the collection is still rolling.",
    notFoundAction: "Browse all series",
    notFoundUpNext: "Up next",
    slateProduction: "Prod.",
    slateScene: "Scene",
    slateTake: "Take",
    slateRoll: "Roll",
    slateDirector: "Dir.",
    slateDirectorName: "You",
    slateAction: "Clap the slate for another take",
    slateHintPress: "Press",
    slateHintKey: "Space",
    slateHintAction: "for another take",
    slateHintTouch: "Tap the slate for another take",
  },
  "zh-CN": {
    languageName: "中文",
    switchLanguage: "English",
    headerDescriptor: "精选短剧系列",
    home: "Reelbound 首页",
    switchToLightMode: "切换为浅色模式",
    switchToDarkMode: "切换为深色模式",
    introEyebrow: "精选抖音 AI 短剧",
    introTitle: ["从一部好剧开始。", "一集一集看下去。"],
    introCopy: "精选抖音 AI 短剧系列，让每一集都值得继续看下去。",
    exploreCollection: "浏览系列",
    heroEyebrow: "Reelbound 精选",
    heroAction: "观看第 1 集",
    heroVideoLabel: "本期精选系列的氛围预告",
    collection: "精心策选",
    seriesHeading: "值得一看的故事",
    seriesCount: "个系列",
    seriesLabel: "Reelbound · 系列",
    episodes: "集",
    watchSeries: "观看系列",
    emptyCatalogue: "第一部系列正在策划中。",
    footer: "认真挑选好故事，留住每一次观看。",
    episode: "第",
    nowPlaying: "正在播放",
    recapBadge: "含回顾",
    previousEpisode: "上一集",
    nextEpisode: "下一集",
    series: "系列",
    backToSeries: "返回系列",
    notFoundEyebrow: "404 · 镜头缺失",
    notFoundTitle: "这场戏没有剪进正片。",
    notFoundCopy: "你要找的页面从未开拍，或已在剪辑中被移走。其他系列仍在放映。",
    notFoundAction: "浏览全部系列",
    notFoundUpNext: "接下来看",
    slateProduction: "片名",
    slateScene: "场次",
    slateTake: "条次",
    slateRoll: "卷",
    slateDirector: "导演",
    slateDirectorName: "你",
    slateAction: "敲一下场记板，再来一条",
    slateHintPress: "按",
    slateHintKey: "空格键",
    slateHintAction: "再来一条",
    slateHintTouch: "轻点场记板，再来一条",
  },
} satisfies Record<Locale, Record<string, string | string[]>>;

export const tagLabels: Record<SeriesTag, LocalizedText> = {
  action: { en: "Action", zh: "动作" },
  apocalypse: { en: "Apocalypse", zh: "末日" },
  "body-swap": { en: "Body swap", zh: "换身" },
  comedy: { en: "Comedy", zh: "喜剧" },
  "coming-of-age": { en: "Coming of age", zh: "成长" },
  drama: { en: "Drama", zh: "剧情" },
  fantasy: { en: "Fantasy", zh: "奇幻" },
  idol: { en: "Idol", zh: "偶像" },
  music: { en: "Music", zh: "音乐" },
  rebirth: { en: "Rebirth", zh: "重生" },
  revenge: { en: "Revenge", zh: "复仇" },
  "sci-fi": { en: "Sci-fi", zh: "科幻" },
  workplace: { en: "Workplace", zh: "职场" },
};

export function tagList(tags: SeriesTag[] | undefined, locale: Locale) {
  return (tags ?? []).map((tag) => localizedText(tagLabels[tag], locale));
}

export type Dictionary = (typeof dictionaries)[Locale];

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
