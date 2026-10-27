"use server";

import { headers } from "next/headers";
import { buildFeedbackIssue, parseFeedback, type FeedbackIssue } from "@/lib/feedback";
import { isLocale } from "@/lib/i18n";
import { siteUrl } from "@/lib/site-url";
import { findFeedbackEpisode } from "./context";

export type FeedbackState =
  | { status: "idle" }
  | { status: "sent" }
  | { status: "error"; reason: "invalid" | "failed" };

export async function submitFeedback(
  _previous: FeedbackState,
  formData: FormData,
): Promise<FeedbackState> {
  const parsed = parseFeedback(formData);
  // Bots get the same answer as people, so there's nothing to probe.
  if (!parsed.ok) return parsed.reason === "spam" ? { status: "sent" } : { status: "error", reason: "invalid" };

  const locale = String(formData.get("locale"));
  if (!isLocale(locale)) return { status: "error", reason: "invalid" };

  // The issue is for the maintainer, so it names the episode in English but
  // links to the page the visitor was actually on.
  const episode = findFeedbackEpisode(formData.get("series"), formData.get("episode"), "en");
  const issue = buildFeedbackIssue({
    submission: parsed.submission,
    locale,
    userAgent: (await headers()).get("user-agent"),
    context: episode && {
      label: episode.label,
      url: new URL(`/${locale}/series/${episode.series}/episode/${episode.episode}`, siteUrl).href,
    },
  });

  return (await createIssue(issue)) ? { status: "sent" } : { status: "error", reason: "failed" };
}

/**
 * Opens the issue with a fine-grained token limited to this repo's issues.
 * Without a token, development logs the issue instead of failing.
 */
async function createIssue(issue: FeedbackIssue) {
  const token = process.env.GITHUB_FEEDBACK_TOKEN;
  const repo = process.env.GITHUB_FEEDBACK_REPO ?? "yeoyujie/reelbound";

  if (!token) {
    if (process.env.NODE_ENV === "development") {
      console.info("[feedback] GITHUB_FEEDBACK_TOKEN is not set; would have opened:", issue);
      return true;
    }
    console.error("[feedback] GITHUB_FEEDBACK_TOKEN is not set.");
    return false;
  }

  try {
    const response = await fetch(`https://api.github.com/repos/${repo}/issues`, {
      method: "POST",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify(issue),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      console.error(`[feedback] GitHub responded ${response.status}: ${await response.text()}`);
    }
    return response.ok;
  } catch (error) {
    console.error("[feedback] Couldn't reach GitHub:", error);
    return false;
  }
}
