import type { Series } from "./types";

export const OvernightStar: Series = {
  slug: "yi-zhao-cheng-ming",
  title: { en: "Overnight Star", zh: "一昭成名" },
  tags: ["drama"],
  thumbnail: "/images/series/yi-zhao-cheng-ming.png",
  description: {
    en: "The stories of show business you never got to hear. An anonymous account starts digging up, one by one, everything award-winning actress Xu Zhao did before she was famous.",
    zh: "演艺圈你不知道的故事这里都有。影后许昭被匿名账号逐条翻出成名前的旧事。",
  },
  episodes: [
    { videoId: "7685335975446492330" },
    { title: { en: "Nirvana", zh: "涅槃" }, videoId: "7688318972261972068" },
    { title: { en: "Center Stage", zh: "C位" }, videoId: "7690540251458736347" },
    { title: { en: "Into the Game", zh: "入局" }, videoId: "7693124498045091755" },
    { title: { en: "Rivals", zh: "对手" }, videoId: "7695751016026244563" },
    {
      kind: "compilation",
      covers: { from: 1, to: 5 },
      title: { en: "Season 1, Part 1 (Remastered)", zh: "第一季上部（重制版）" },
      videoId: "7697136835117485331",
    },
  ],
};
