"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState, type ReactNode } from "react";
import { submitFeedback, type FeedbackState } from "@/app/[lang]/feedback/actions";
import type { FeedbackEpisode } from "@/app/[lang]/feedback/context";
import {
  feedbackTypes,
  messageLength,
  suggestionMaxLength,
  type FeedbackType,
} from "@/lib/feedback";
import type { Dictionary, Locale } from "@/lib/i18n";

export type FeedbackDictionary = Pick<Dictionary, Extract<keyof Dictionary, `feedback${string}`>>;

type FeedbackFormProps = {
  locale: Locale;
  dictionary: FeedbackDictionary;
  initialType?: FeedbackType;
  /** The episode the visitor came from, when they used "Report a problem". */
  episode?: FeedbackEpisode;
};

const typeIcons: Record<FeedbackType, ReactNode> = {
  bug: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5v5.25M12 16.25v.25" />
    </>
  ),
  feature: (
    <path d="M9.5 18h5M10.5 21h3M12 3a6 6 0 0 0-3.5 10.9c.6.4.9 1 .9 1.7V16h5.2v-.4c0-.7.3-1.3.9-1.7A6 6 0 0 0 12 3Z" />
  ),
  series: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="M12 9v6M9 12h6" />
    </>
  ),
};

/** "Send another" starts over with a fresh form and action state. */
export function FeedbackForm(props: FeedbackFormProps) {
  const [round, setRound] = useState(0);
  return <FeedbackFormRound key={round} {...props} onRestart={() => setRound(round + 1)} />;
}

function FeedbackFormRound({
  locale,
  dictionary,
  initialType,
  episode,
  onRestart,
}: FeedbackFormProps & { onRestart: () => void }) {
  const [state, formAction, pending] = useActionState<FeedbackState, FormData>(submitFeedback, {
    status: "idle",
  });
  // Controlled, because React resets uncontrolled fields after every submit and
  // a failed send must keep the visitor's words.
  const [type, setType] = useState<FeedbackType | undefined>(initialType);
  const [message, setMessage] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [attachEpisode, setAttachEpisode] = useState(Boolean(episode));
  const openedAt = useRef(0);
  const sentHeading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    openedAt.current = Date.now();
  }, []);

  useEffect(() => {
    if (state.status === "sent") sentHeading.current?.focus();
  }, [state.status]);

  if (state.status === "sent") {
    const backToEpisode = attachEpisode && episode;
    return (
      <section className="feedback-sent" aria-labelledby="feedback-sent-heading">
        <span className="feedback-sent-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="m6 12.5 4 4 8-9" />
          </svg>
        </span>
        <h2 id="feedback-sent-heading" ref={sentHeading} tabIndex={-1}>
          {dictionary.feedbackSentTitle}
        </h2>
        <p>{dictionary.feedbackSentCopy}</p>
        <div className="feedback-sent-actions">
          <Link
            className="connect-action is-primary"
            href={backToEpisode ? episode.path : `/${locale}`}
          >
            {backToEpisode ? dictionary.feedbackBackToWatching : dictionary.feedbackBrowse}
            <span aria-hidden="true">→</span>
          </Link>
          <button type="button" className="connect-action" onClick={onRestart}>
            {dictionary.feedbackSendAnother}
          </button>
        </div>
      </section>
    );
  }

  const typeIndex = type ? feedbackTypes.indexOf(type) : 0;
  const messageLengthNow = message.trim().length;

  return (
    <form
      className="feedback-form"
      action={(formData) => {
        formData.set("elapsed", String(Date.now() - openedAt.current));
        formAction(formData);
      }}
    >
      <input type="hidden" name="locale" value={locale} />
      {episode && attachEpisode && (
        <>
          <input type="hidden" name="series" value={episode.series} />
          <input type="hidden" name="episode" value={episode.episode} />
        </>
      )}
      {/* Hidden from people and assistive tech; bots that fill every field reveal themselves. */}
      <div className="feedback-honeypot" aria-hidden="true">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <fieldset className="feedback-types">
        <legend className="feedback-label">{dictionary.feedbackTypeLegend}</legend>
        <div className="feedback-type-grid">
          {feedbackTypes.map((value, index) => (
            <label key={value} className="feedback-type" data-type={value}>
              <input
                type="radio"
                name="type"
                value={value}
                required
                checked={type === value}
                onChange={() => setType(value)}
              />
              <svg className="feedback-type-icon" viewBox="0 0 24 24" aria-hidden="true">
                {typeIcons[value]}
              </svg>
              <span className="feedback-type-name">{dictionary.feedbackTypeNames[index]}</span>
              <span className="feedback-type-description">
                {dictionary.feedbackTypeDescriptions[index]}
              </span>
              <span className="feedback-type-check" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="m6 12.5 4 4 8-9" />
                </svg>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {episode && attachEpisode && (
        <p className="feedback-context">
          <span className="feedback-context-label">{dictionary.feedbackAbout}</span>
          <span className="feedback-context-value">{episode.label}</span>
          <button
            type="button"
            className="feedback-context-remove"
            aria-label={`${dictionary.feedbackRemoveContext}: ${episode.label}`}
            title={dictionary.feedbackRemoveContext}
            onClick={() => setAttachEpisode(false)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m7 7 10 10M17 7 7 17" />
            </svg>
          </button>
        </p>
      )}

      {type === "series" && (
        <div className="feedback-field">
          <label className="feedback-label" htmlFor="feedback-suggestion">
            {dictionary.feedbackSuggestion}
            <span className="feedback-optional">{dictionary.feedbackOptional}</span>
          </label>
          <input
            id="feedback-suggestion"
            className="feedback-input"
            name="suggestion"
            value={suggestion}
            maxLength={suggestionMaxLength}
            autoComplete="off"
            onChange={(event) => setSuggestion(event.target.value)}
          />
        </div>
      )}

      <div className="feedback-field">
        <label className="feedback-label" htmlFor="feedback-message">
          {dictionary.feedbackMessage}
        </label>
        <textarea
          id="feedback-message"
          className="feedback-input"
          name="message"
          rows={6}
          required
          minLength={messageLength.min}
          maxLength={messageLength.max}
          placeholder={dictionary.feedbackPlaceholders[typeIndex]}
          aria-describedby="feedback-message-hint"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />
        <p id="feedback-message-hint" className="feedback-hint">
          <span>{dictionary.feedbackPublicNote}</span>
          <span className="feedback-count" data-short={messageLengthNow < messageLength.min || undefined}>
            {messageLengthNow < messageLength.min
              ? dictionary.feedbackMinimum.replace("{min}", String(messageLength.min))
              : dictionary.feedbackCount
                  .replace("{count}", String(message.length))
                  .replace("{max}", String(messageLength.max))}
          </span>
        </p>
      </div>

      {state.status === "error" && (
        <p className="feedback-error" role="alert">
          {state.reason === "invalid"
            ? dictionary.feedbackErrorInvalid
            : dictionary.feedbackErrorFailed}
        </p>
      )}

      <button type="submit" className="feedback-submit" disabled={pending}>
        {pending ? dictionary.feedbackSending : dictionary.feedbackSend}
        {!pending && <span aria-hidden="true">→</span>}
      </button>
    </form>
  );
}
