import type { LocalizedText } from "@/data/series";

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
    headerDescriptor: "A curated series collection",
    home: "NextFrame home",
    switchToLightMode: "Switch to light mode",
    switchToDarkMode: "Switch to dark mode",
    introEyebrow: "Curated AI series from Douyin",
    introTitle: ["Find a story.", "Stay for the next frame."],
    introCopy: "Discover AI-generated series from Douyin, curated for stories that keep you watching.",
    collection: "The collection",
    seriesHeading: "Series to get lost in",
    seriesCount: "series",
    seriesLabel: "NextFrame · Series",
    episodes: "episodes",
    watchSeries: "Watch series",
    emptyCatalogue: "The first series is being curated.",
    footer: "Stories made to be watched in sequence.",
    episode: "Episode",
    nowPlaying: "Now playing",
    previousEpisode: "Previous episode",
    nextEpisode: "Next episode",
    series: "Series",
    backToSeries: "Back to series",
  },
  "zh-CN": {
    languageName: "中文",
    switchLanguage: "English",
    headerDescriptor: "精选系列内容",
    home: "NextFrame 首页",
    switchToLightMode: "切换为浅色模式",
    switchToDarkMode: "切换为深色模式",
    introEyebrow: "精选抖音 AI 系列",
    introTitle: ["故事，从这一帧开始。", "精彩，未完待续。"],
    introCopy: "探索来自抖音的 AI 系列作品，精选每一个值得一直看下去的故事。",
    collection: "系列精选",
    seriesHeading: "沉浸于这些故事",
    seriesCount: "个系列",
    seriesLabel: "NextFrame · 系列",
    episodes: "集",
    watchSeries: "观看系列",
    emptyCatalogue: "第一部系列正在策划中。",
    footer: "让故事一集接一集地继续。",
    episode: "第",
    nowPlaying: "正在播放",
    previousEpisode: "上一集",
    nextEpisode: "下一集",
    series: "系列",
    backToSeries: "返回系列",
  },
} satisfies Record<Locale, Record<string, string | string[]>>;

export type Dictionary = (typeof dictionaries)[Locale];

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
