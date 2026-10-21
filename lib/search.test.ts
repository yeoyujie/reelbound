import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  highlight,
  normalize,
  parseEpisodeReference,
  parseNumber,
  searchCatalog,
  snippet,
  type SearchIndex,
  type SearchIndexEpisode,
} from "./search.ts";

function episodes(count: number, season = 1): SearchIndexEpisode[] {
  return Array.from({ length: count }, (_, index) => ({
    slug: season === 1 ? `${index + 1}` : `s${season}-e${index + 1}`,
    kind: "episode",
    season,
    number: index + 1,
    label: { en: `Episode ${index + 1}`, zh: `第 ${index + 1} 集` },
  }));
}

const index: SearchIndex = {
  series: [
    {
      slug: "nova",
      title: { en: "Nova", zh: "诺娃" },
      description: { en: "An android learns what it means to grieve.", zh: "一个仿生人学会了悲伤。" },
      tags: [{ en: "Sci-fi", zh: "科幻" }],
      episodeCount: 12,
      entryEpisode: "1",
      episodes: [
        ...episodes(11),
        {
          slug: "12",
          kind: "episode",
          season: 1,
          number: 12,
          label: { en: "Episode 12", zh: "第 12 集" },
          title: { en: "The Last Signal", zh: "最后的信号" },
          description: { en: "An old voice returns.", zh: "旧日的声音回来了。" },
        },
        {
          slug: "1-12",
          kind: "compilation",
          season: 1,
          label: { en: "Episodes 1–12 · Compilation", zh: "第 1–12 集合集" },
          title: { en: "The Last Signal: full cut", zh: "最后的信号：合集" },
        },
      ],
    },
    {
      slug: "gui-xu",
      title: { en: "The Age of New Species", zh: "归墟" },
      description: { en: "A revenge story at the end of the world.", zh: "世界尽头的复仇故事。" },
      tags: [
        { en: "Apocalypse", zh: "末日" },
        { en: "Revenge", zh: "复仇" },
      ],
      episodeCount: 23,
      entryEpisode: "1",
      episodes: [
        ...episodes(20),
        ...episodes(3, 2),
        {
          slug: "special-1",
          kind: "special",
          season: 1,
          label: { en: "Special", zh: "番外" },
          title: { en: "Before the Fall", zh: "坠落之前" },
        },
      ],
    },
    {
      slug: "chong-hui",
      title: { en: "Back at 100 Kilos", zh: "重回200斤，我C位出道" },
      description: { en: "An idol starts again.", zh: "偶像重新出发。" },
      tags: [{ en: "Idol", zh: "偶像" }],
      episodeCount: 5,
      entryEpisode: "1",
      episodes: episodes(5),
    },
  ],
};

const seriesSlugs = (query: string) => searchCatalog(index, query).series.map((r) => r.series.slug);
const episodeKeys = (query: string) =>
  searchCatalog(index, query).episodes.map((r) => `${r.series.slug}/${r.episode.slug}`);

describe("normalize", () => {
  it("lowercases, strips accents and folds full-width forms without changing length", () => {
    assert.equal(normalize("Café ＮＯＶＡ"), "cafe nova");
    assert.equal(normalize("Café ＮＯＶＡ").length, "Café ＮＯＶＡ".length);
  });
});

describe("parseNumber", () => {
  it("reads Arabic and Chinese numerals", () => {
    assert.equal(parseNumber("12"), 12);
    assert.equal(parseNumber("十二"), 12);
    assert.equal(parseNumber("二十"), 20);
    assert.equal(parseNumber("一百零五"), 105);
    assert.ok(Number.isNaN(parseNumber("abc")));
  });
});

describe("parseEpisodeReference", () => {
  it("finds an episode after a series name", () => {
    assert.deepEqual(parseEpisodeReference("nova 12"), { episode: 12, season: undefined, rest: "nova" });
    assert.deepEqual(parseEpisodeReference("Nova ep 12"), { episode: 12, season: undefined, rest: "nova" });
  });

  it("finds seasons and episodes in English and Chinese", () => {
    assert.deepEqual(parseEpisodeReference("gui xu s2e3"), { episode: 3, season: 2, rest: "gui xu" });
    assert.deepEqual(parseEpisodeReference("season 2 episode 3"), { episode: 3, season: 2, rest: "" });
    assert.deepEqual(parseEpisodeReference("归墟第二季第三集"), { episode: 3, season: 2, rest: "归墟" });
    assert.deepEqual(parseEpisodeReference("第12集"), { episode: 12, season: undefined, rest: "" });
  });

  it("ignores numbers that are part of a title", () => {
    assert.equal(parseEpisodeReference("重回200斤"), null);
    assert.equal(parseEpisodeReference("nova"), null);
  });
});

describe("searchCatalog", () => {
  it("lists every series in catalogue order for an empty query", () => {
    const results = searchCatalog(index, "   ");
    assert.deepEqual(results.series.map((r) => r.series.slug), ["nova", "gui-xu", "chong-hui"]);
    assert.deepEqual(results.episodes, []);
  });

  it("matches titles in either language", () => {
    assert.deepEqual(seriesSlugs("nova"), ["nova"]);
    assert.deepEqual(seriesSlugs("归墟"), ["gui-xu"]);
    assert.equal(searchCatalog(index, "归墟").series[0].match.field, "title");
    assert.deepEqual(searchCatalog(index, "归墟").series[0].match, { field: "title", language: "zh" });
  });

  it("matches Chinese text anywhere in a title", () => {
    assert.deepEqual(seriesSlugs("c位"), ["chong-hui"]);
  });

  it("requires every term to match", () => {
    assert.deepEqual(seriesSlugs("age species"), ["gui-xu"]);
    assert.deepEqual(seriesSlugs("age nova"), []);
  });

  it("matches tags and, for long enough terms, descriptions", () => {
    assert.deepEqual(seriesSlugs("revenge"), ["gui-xu"]);
    assert.deepEqual(seriesSlugs("复仇"), ["gui-xu"]);
    assert.deepEqual(seriesSlugs("grieve"), ["nova"]);
    // "an" is too short to search descriptions, and only matches word starts.
    assert.deepEqual(seriesSlugs("an"), []);
  });

  it("ranks a title match above a description match", () => {
    const results = searchCatalog(index, "idol");
    assert.equal(results.series[0].series.slug, "chong-hui");
  });

  it("jumps to a numbered episode of a named series", () => {
    assert.equal(episodeKeys("nova 12")[0], "nova/12");
    assert.equal(episodeKeys("归墟第二季第三集")[0], "gui-xu/s2-e3");
    assert.deepEqual(seriesSlugs("nova 12"), ["nova"]);
  });

  it("matches a bare episode number in every series", () => {
    assert.deepEqual(episodeKeys("第3集"), ["nova/3", "gui-xu/3", "gui-xu/s2-e3", "chong-hui/3"]);
  });

  it("matches episode titles without listing every episode for a series name", () => {
    assert.deepEqual(episodeKeys("nova"), []);
    assert.equal(episodeKeys("last signal")[0], "nova/12");
    assert.equal(episodeKeys("坠落")[0], "gui-xu/special-1");
  });

  it("ranks compilations after regular episodes with the same match", () => {
    assert.deepEqual(episodeKeys("last signal"), ["nova/12", "nova/1-12"]);
  });

  it("caps episode results", () => {
    assert.equal(searchCatalog(index, "1", { episodeLimit: 2 }).episodes.length, 2);
  });
});

describe("highlight", () => {
  it("marks matched parts of the original text", () => {
    assert.deepEqual(highlight("The Age of New Species", "age spec"), [
      { text: "The ", match: false },
      { text: "Age", match: true },
      { text: " of New ", match: false },
      { text: "Spec", match: true },
      { text: "ies", match: false },
    ]);
  });

  it("keeps accented originals while matching unaccented queries", () => {
    assert.deepEqual(highlight("Café", "cafe"), [{ text: "Café", match: true }]);
  });

  it("returns the text unchanged without a match", () => {
    assert.deepEqual(highlight("Nova", "xyz"), [{ text: "Nova", match: false }]);
  });
});

describe("snippet", () => {
  it("starts just before the first match", () => {
    const text = `${"a".repeat(100)} revenge ${"b".repeat(100)}`;
    const result = snippet(text, "revenge", 30);
    assert.ok(result.startsWith("…"));
    assert.ok(result.endsWith("…"));
    assert.ok(result.indexOf("revenge") <= 14);
  });

  it("always includes the whole match", () => {
    assert.ok(snippet(`${"a".repeat(50)} revenge`, "revenge", 5).endsWith("revenge"));
  });
});
