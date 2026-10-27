import { z } from "zod";

/*
 * Visitor feedback. Submissions become issues on the public GitHub repo, so
 * everything here treats the visitor's text as untrusted and keeps the issue
 * free of anything that could ping people or load remote content.
 */

export const feedbackTypes = ["bug", "feature", "series"] as const;
export type FeedbackType = (typeof feedbackTypes)[number];

export const messageLength = { min: 10, max: 2000 };
export const suggestionMaxLength = 200;

/** Humans take longer than this to pick a type and write ten characters. */
export const minimumFillMs = 3000;

const typeLabels: Record<FeedbackType, string> = {
  bug: "bug",
  feature: "enhancement",
  series: "series-request",
};

export function isFeedbackType(value: unknown): value is FeedbackType {
  return feedbackTypes.includes(value as FeedbackType);
}

const submissionSchema = z.object({
  type: z.enum(feedbackTypes),
  message: z.string().trim().min(messageLength.min).max(messageLength.max),
  suggestion: z.string().trim().max(suggestionMaxLength),
});

export type FeedbackSubmission = z.infer<typeof submissionSchema>;

export type ParsedFeedback =
  | { ok: true; submission: FeedbackSubmission }
  | { ok: false; reason: "invalid" | "spam" };

/**
 * Reads the form. `website` is a honeypot hidden from people, and `elapsed`
 * is how long the form was open; either flags a bot.
 */
export function parseFeedback(formData: FormData): ParsedFeedback {
  if (formData.get("website")) return { ok: false, reason: "spam" };
  const elapsed = Number(formData.get("elapsed"));
  if (!Number.isFinite(elapsed) || elapsed < minimumFillMs) return { ok: false, reason: "spam" };

  const type = formData.get("type");
  const result = submissionSchema.safeParse({
    type,
    message: formData.get("message") ?? "",
    // Only series requests have a suggestion field.
    suggestion: (type === "series" && formData.get("suggestion")) || "",
  });
  return result.success
    ? { ok: true, submission: result.data }
    : { ok: false, reason: "invalid" };
}

export type FeedbackIssueContext = {
  /** e.g. "The Last Human · Episode 4" */
  label: string;
  url: string;
};

export type FeedbackIssue = { title: string; body: string; labels: string[] };

const typeHeadings: Record<FeedbackType, string> = {
  bug: "Bug report",
  feature: "Feature request",
  series: "New series suggestion",
};

export function buildFeedbackIssue({
  submission,
  context,
  locale,
  userAgent,
}: {
  submission: FeedbackSubmission;
  context?: FeedbackIssueContext;
  locale: string;
  userAgent?: string | null;
}): FeedbackIssue {
  const firstLine = submission.message.split("\n")[0].trim();
  const summary = firstLine.length > 60 ? `${firstLine.slice(0, 59).trimEnd()}…` : firstLine;

  const details = [
    `**Type:** ${typeHeadings[submission.type]}`,
    context && `**Page:** [${escapeMarkdown(context.label)}](${context.url})`,
    `**Locale:** ${locale}`,
    userAgent && `**Browser:** \`${userAgent.replaceAll("`", "'")}\``,
  ].filter(Boolean);

  const sections = [
    "### Message",
    codeBlock(submission.message),
    submission.suggestion && "### Series",
    submission.suggestion && codeBlock(submission.suggestion),
    "### Details",
    details.join("\n"),
    "<sub>Sent from the Reelbound feedback form.</sub>",
  ].filter(Boolean);

  return {
    title: `[Feedback] ${summary}`,
    body: sections.join("\n\n"),
    labels: ["feedback", typeLabels[submission.type]],
  };
}

/**
 * Fences visitor text so GitHub shows it verbatim: no @mentions, issue links,
 * images or HTML. The fence is longer than any backtick run inside the text.
 */
function codeBlock(text: string) {
  const longestRun = Math.max(0, ...(text.match(/`+/g) ?? []).map((run) => run.length));
  const fence = "`".repeat(Math.max(3, longestRun + 1));
  return `${fence}text\n${text}\n${fence}`;
}

function escapeMarkdown(text: string) {
  return text.replace(/[\\`*_[\]<>@#]/g, "\\$&");
}
