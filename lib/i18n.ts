import type { LocalizedText, SeriesTag } from "@/data/series";

export const locales = ["en", "zh-CN"] as const;
export type Locale = (typeof locales)[number];

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function localizedText(text: LocalizedText, locale: Locale) {
  return text[locale === "zh-CN" ? "zh" : "en"];
}

/**
 * Canonical and hreflang links for a page that exists in every locale. `path`
 * leaves out the locale ("" for the homepage). Paths resolve against
 * `metadataBase`; "x-default" is the unprefixed URL, which the proxy
 * redirects by Accept-Language.
 */
export function localeAlternates(locale: Locale, path: string) {
  return {
    canonical: `/${locale}${path}`,
    languages: {
      en: `/en${path}`,
      "zh-CN": `/zh-CN${path}`,
      "x-default": path || "/",
    } satisfies Record<Locale | "x-default", string>,
  };
}

export const dictionaries = {
  en: {
    languageName: "English",
    switchLanguage: "中文",
    tagline: "Curated short series",
    home: "Reelbound home",
    switchToLightMode: "Switch to light mode",
    switchToDarkMode: "Switch to dark mode",
    search: "Search",
    searchLabel: "Search series and episodes",
    searchPlaceholder: "Series, episodes, genres…",
    searchCancel: "Cancel",
    searchAllSeries: "All series",
    searchSeriesGroup: "Series",
    searchEpisodesGroup: "Episodes",
    searchLoading: "Loading the collection…",
    searchError: "Search couldn't load.",
    searchRetry: "Try again",
    searchNoResults: "Nothing matches “{query}”.",
    searchTryGenre: "Try a genre",
    searchResultCount: "{count} results",
    searchResultCountOne: "1 result",
    searchHintMove: "to move",
    searchHintOpen: "to open",
    searchHintClose: "to close",
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
    share: "Share",
    shareEpisode: "Share this episode",
    copyLink: "Copy link",
    linkCopied: "Copied",
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
    connectLink: "Use Reelbound in your AI assistant",
    connectMetaDescription:
      "Connect Reelbound to Claude, ChatGPT, Cursor or your coding agent, then ask for something to watch and get a link straight to the episode.",
    connectEyebrow: "Reelbound for AI assistants",
    connectTitle: "Ask your assistant what to watch.",
    connectLede: "Connect Reelbound to Claude, ChatGPT or your coding agent. Ask for a series by mood, genre or plot, and get a link straight to the episode.",
    connectFacts: ["Free", "Read-only", "No account needed"],
    connectServerUrl: "Server URL",
    connectCopy: "Copy",
    connectChooseClient: "Choose your assistant",
    connectOther: "Other",
    connectClaudeSteps: [
      "In Claude, open Customize, then Connectors.",
      "Choose Add custom connector, name it Reelbound and paste the server URL.",
      "Choose No sign in, then start a new chat.",
    ],
    connectOpenClaude: "Open Claude connectors",
    connectChatgptSteps: [
      "In ChatGPT, open Plugins and select +.",
      "Choose Add custom MCP server, name it Reelbound and paste the server URL.",
      "Install it, then mention @Reelbound in a chat.",
    ],
    connectChatgptNote: "Custom servers depend on your ChatGPT plan and workspace settings.",
    connectOpenChatgpt: "Open ChatGPT plugins",
    connectRunCommand: "Run this in your terminal:",
    connectOrConfig: "Or add it to {file}:",
    connectAddToCursor: "Add to Cursor",
    connectAddToVscode: "Add to VS Code",
    connectOneClickNote: "Opens the app so you can confirm. Nothing happening? Use the option below.",
    connectOrCommand: "Or run:",
    connectOtherCopy:
      "Any client that supports remote MCP servers can connect with the server URL above. It uses the Streamable HTTP transport and needs no sign-in.",
    connectKimiNote:
      "Moonshot AI's coding agent. The Kimi chat app can't connect to MCP servers yet.",
    connectKimiSteps: [
      "In Kimi Code, run /mcp-config.",
      "Add a server named reelbound and paste the server URL.",
    ],
    connectDeepseekNote:
      "DeepSeek's open-source agent, in developer preview. The DeepSeek chat app can't connect to MCP servers yet.",
    connectAddConfig: "Add it to {file}:",
    connectTryAsking: "Then try asking",
    connectPrompts: [
      "What should I watch tonight on Reelbound?",
      "Find me a short revenge drama.",
      "What happens after episode 3 of NOVA?",
    ],
  },
  "zh-CN": {
    languageName: "中文",
    switchLanguage: "English",
    tagline: "精选短剧系列",
    home: "Reelbound 首页",
    switchToLightMode: "切换为浅色模式",
    switchToDarkMode: "切换为深色模式",
    search: "搜索",
    searchLabel: "搜索系列和剧集",
    searchPlaceholder: "系列、剧集、类型…",
    searchCancel: "取消",
    searchAllSeries: "全部系列",
    searchSeriesGroup: "系列",
    searchEpisodesGroup: "剧集",
    searchLoading: "正在载入片单…",
    searchError: "搜索暂时无法载入。",
    searchRetry: "重试",
    searchNoResults: "没有与“{query}”相关的内容。",
    searchTryGenre: "试试这些类型",
    searchResultCount: "{count} 个结果",
    searchResultCountOne: "1 个结果",
    searchHintMove: "移动",
    searchHintOpen: "打开",
    searchHintClose: "关闭",
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
    share: "分享",
    shareEpisode: "分享这一集",
    copyLink: "复制链接",
    linkCopied: "已复制",
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
    connectLink: "在 AI 助手中使用 Reelbound",
    connectMetaDescription:
      "把 Reelbound 连接到 Kimi Code、DeepSeek Harness、Cursor 等 AI 助手，说出想看的内容，直接拿到剧集链接。",
    connectEyebrow: "Reelbound × AI 助手",
    connectTitle: "问问你的 AI，今晚看什么。",
    connectLede: "把 Reelbound 连接到 Kimi Code、DeepSeek Harness、Cursor 等 AI 助手。按心情、类型或剧情找剧，直接拿到对应剧集的链接。",
    connectFacts: ["免费", "只读", "无需账号"],
    connectServerUrl: "服务器地址",
    connectCopy: "复制",
    connectChooseClient: "选择你的助手",
    connectOther: "其他",
    connectClaudeSteps: [
      "在 Claude 中打开 Customize，再进入 Connectors。",
      "选择 Add custom connector，命名为 Reelbound，并粘贴服务器地址。",
      "选择 No sign in，然后开始新对话。",
    ],
    connectOpenClaude: "打开 Claude 连接器",
    connectChatgptSteps: [
      "在 ChatGPT 中打开 Plugins，点击 +。",
      "选择 Add custom MCP server，命名为 Reelbound，并粘贴服务器地址。",
      "安装后，在对话中输入 @Reelbound。",
    ],
    connectChatgptNote: "能否添加自定义服务器，取决于你的 ChatGPT 套餐和工作区设置。",
    connectOpenChatgpt: "打开 ChatGPT 插件",
    connectRunCommand: "在终端中运行：",
    connectOrConfig: "或添加到 {file}：",
    connectAddToCursor: "添加到 Cursor",
    connectAddToVscode: "添加到 VS Code",
    connectOneClickNote: "会打开应用供你确认。没有反应？请使用下方方式。",
    connectOrCommand: "或运行：",
    connectOtherCopy:
      "任何支持远程 MCP 服务器的客户端，都可以用上方的服务器地址连接。使用 Streamable HTTP 传输，无需登录。",
    connectKimiNote: "月之暗面的编程助手。Kimi 聊天应用暂不支持连接 MCP 服务器。",
    connectKimiSteps: ["在 Kimi Code 中运行 /mcp-config。", "添加名为 reelbound 的服务器，并粘贴服务器地址。"],
    connectDeepseekNote:
      "DeepSeek 的开源智能体，目前为开发者预览版。DeepSeek 聊天应用暂不支持连接 MCP 服务器。",
    connectAddConfig: "添加到 {file}：",
    connectTryAsking: "然后试着问",
    connectPrompts: [
      "今晚在 Reelbound 上看什么好？",
      "给我找一部短一点的复仇剧。",
      "《NOVA》第 3 集之后发生了什么？",
    ],
  },
} satisfies Record<Locale, Record<string, string | string[]>>;

export const tagLabels: Record<SeriesTag, LocalizedText> = {
  action: { en: "Action", zh: "动作" },
  apocalypse: { en: "Apocalypse", zh: "末日" },
  comedy: { en: "Comedy", zh: "喜剧" },
  "coming-of-age": { en: "Coming of age", zh: "成长" },
  drama: { en: "Drama", zh: "剧情" },
  fantasy: { en: "Fantasy", zh: "奇幻" },
  idol: { en: "Idol", zh: "偶像" },
  music: { en: "Music", zh: "音乐" },
  rebirth: { en: "Rebirth", zh: "重生" },
  revenge: { en: "Revenge", zh: "复仇" },
  "sci-fi": { en: "Sci-fi", zh: "科幻" },
};

export function tagList(tags: SeriesTag[] | undefined, locale: Locale) {
  return (tags ?? []).map((tag) => localizedText(tagLabels[tag], locale));
}

export type Dictionary = (typeof dictionaries)[Locale];

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
