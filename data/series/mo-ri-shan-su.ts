import type { Series } from "./types";

export const DoomsdayMountainLodge: Series = {
  slug: "mo-ri-shan-su",
  title: { en: "Doomsday Mountain Lodge", zh: "末日山宿" },
  tags: ["apocalypse"],
  thumbnail: "/images/series/mo-ri-shan-su.png",
  description: {
    en: "Three days after the signal died for good, the infected found us. A survival story set around a mountain lodge at the end of the world, now in its second season.",
    zh: "信号彻底消失的第三天，我们被感染者盯上了。围绕一座山中民宿展开的末日求生故事，现已更新至第二季。",
  },
  episodes: [
    {
      title: { en: "Episodes 1–4", zh: "第1–4集" },
      description: {
        en: "Episodes 1–4 in one go, in 4K. Episodes 1 and 2 were re-edited after being taken down.",
        zh: "一口气看完第1–4集，4K版。第1、2集为重新审核修改后的版本。",
      },
      videoId: "7625120467451514131",
    },
    { episode: 5, videoId: "7642343910555143430" },
    { videoId: "7645703099738295615" },
    { videoId: "7648255464001522970" },
    { videoId: "7650498840583277876" },
    { videoId: "7652729949853355302" },
    { videoId: "7656039779124972850" },
    { videoId: "7657573216151522612" },
    {
      kind: "compilation",
      description: {
        en: "Episodes 1–11 in one go: nearly 50 minutes of the apocalypse, in 4K.",
        zh: "一口气看完第1–11集，接近50分钟的末日4K完整版。",
      },
      videoId: "7658157163897949466",
    },
    { season: 2, title: { en: "New Life", zh: "新生" }, videoId: "7692443271783664936" },
    {
      season: 2,
      title: {
        en: "The Driver Made It Back — but the Supplies Didn't",
        zh: "司机活着回来了，车上的物资却不见了",
      },
      videoId: "7693621673664302377",
    },
    {
      season: 2,
      title: {
        en: "A Huge Shelter in an Abandoned Mountain School!",
        zh: "深山废弃小学惊现大型庇护所！",
      },
      videoId: "7695403333460299017",
    },
    { season: 2, videoId: "7697634742128119050" },
    {
      season: 2,
      title: {
        en: "A Pile of Bones in the Cave — What Have They Been Feeding?",
        zh: "山洞惊现白骨堆，他们喂的到底是什么？",
      },
      videoId: "7700209430255652130",
    },
  ],
};
