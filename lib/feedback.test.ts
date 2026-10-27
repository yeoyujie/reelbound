import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildFeedbackIssue, parseFeedback, type FeedbackSubmission } from "./feedback.ts";

function form(fields: Record<string, string>) {
  const data = new FormData();
  for (const [name, value] of Object.entries(fields)) data.set(name, value);
  return data;
}

const valid = { type: "bug", message: "The player stays black on episode 4.", elapsed: "8000" };

describe("parseFeedback", () => {
  it("accepts a well-formed submission and trims the message", () => {
    const parsed = parseFeedback(form({ ...valid, message: "  Video never starts.  " }));
    assert.deepEqual(parsed, {
      ok: true,
      submission: { type: "bug", message: "Video never starts.", suggestion: "" },
    });
  });

  it("flags a filled honeypot or an instant submission as spam", () => {
    assert.deepEqual(parseFeedback(form({ ...valid, website: "https://spam.example" })), {
      ok: false,
      reason: "spam",
    });
    assert.deepEqual(parseFeedback(form({ ...valid, elapsed: "400" })), { ok: false, reason: "spam" });
    assert.deepEqual(parseFeedback(form({ type: "bug", message: valid.message })), {
      ok: false,
      reason: "spam",
    });
  });

  it("rejects unknown types and messages outside the length limits", () => {
    assert.equal(parseFeedback(form({ ...valid, type: "praise" })).ok, false);
    assert.equal(parseFeedback(form({ ...valid, message: "short     " })).ok, false);
    assert.equal(parseFeedback(form({ ...valid, message: "x".repeat(2001) })).ok, false);
  });

  it("keeps the series suggestion only for series requests", () => {
    const series = parseFeedback(
      form({ ...valid, type: "series", suggestion: " 再生存游戏当道中人 " }),
    );
    assert.equal(series.ok && series.submission.suggestion, "再生存游戏当道中人");

    const bug = parseFeedback(form({ ...valid, suggestion: "ignored" }));
    assert.equal(bug.ok && bug.submission.suggestion, "");
  });
});

describe("buildFeedbackIssue", () => {
  const submission: FeedbackSubmission = {
    type: "bug",
    message: "Episode 4 never loads\nIt just spins.",
    suggestion: "",
  };

  it("labels by type and titles from the first line", () => {
    const issue = buildFeedbackIssue({ submission, locale: "en" });
    assert.equal(issue.title, "[Feedback] Episode 4 never loads");
    assert.deepEqual(issue.labels, ["feedback", "bug"]);
    assert.deepEqual(
      buildFeedbackIssue({ submission: { ...submission, type: "series" }, locale: "en" }).labels,
      ["feedback", "series-request"],
    );
  });

  it("truncates long titles", () => {
    const issue = buildFeedbackIssue({
      submission: { ...submission, message: "a".repeat(100) },
      locale: "en",
    });
    assert.equal(issue.title, `[Feedback] ${"a".repeat(59)}…`);
  });

  it("fences visitor text so mentions and markdown stay inert", () => {
    const message = "Hey @someone see #1 ```\n![x](https://tracker.example/x.png)";
    const issue = buildFeedbackIssue({ submission: { ...submission, message }, locale: "en" });
    assert.ok(issue.body.includes(`\`\`\`\`text\n${message}\n\`\`\`\``));
  });

  it("includes the page, locale and browser", () => {
    const issue = buildFeedbackIssue({
      submission,
      locale: "zh-CN",
      userAgent: "Mozilla/5.0",
      context: { label: "NOVA · Episode 4", url: "https://example.com/zh-CN/series/nova/episode/4" },
    });
    assert.ok(issue.body.includes("[NOVA · Episode 4](https://example.com/zh-CN/series/nova/episode/4)"));
    assert.ok(issue.body.includes("**Locale:** zh-CN"));
    assert.ok(issue.body.includes("`Mozilla/5.0`"));
  });
});
