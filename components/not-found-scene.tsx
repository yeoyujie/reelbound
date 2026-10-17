"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useEffectEvent, useState, type PointerEvent } from "react";
import type { LocalizedText } from "@/data/series";
import { trackSpotlight } from "@/components/episode-navigation";
import { LinkPendingIndicator } from "@/components/link-pending-indicator";
import { getDictionary, isLocale, localizedText, type Locale } from "@/lib/i18n";

export type NotFoundPick = {
  path: string;
  title: LocalizedText;
  tags: LocalizedText[];
  episodeCount: number;
  thumbnail?: string;
};

// Written straight to CSS so pointer moves never re-render.
function trackPointer(event: PointerEvent<HTMLElement>) {
  if (event.pointerType !== "mouse") return;
  const rect = event.currentTarget.getBoundingClientRect();
  const { style } = event.currentTarget;
  style.setProperty("--pointer-x", ((event.clientX - rect.left) / rect.width).toFixed(3));
  style.setProperty("--pointer-y", ((event.clientY - rect.top) / rect.height).toFixed(3));
}

function resetPointer(event: PointerEvent<HTMLElement>) {
  event.currentTarget.style.removeProperty("--pointer-x");
  event.currentTarget.style.removeProperty("--pointer-y");
}

// not-found receives no params.
function useLocale(): Locale {
  const segment = usePathname()?.split("/")[1] ?? "";
  return isLocale(segment) ? segment : "en";
}

export function NotFoundScene({ picks }: { picks: NotFoundPick[] }) {
  const locale = useLocale();
  const dictionary = getDictionary(locale);
  const [take, setTake] = useState(1);
  // Chosen a take ahead so its poster preloads before the cut.
  const [order, setOrder] = useState({ current: 0, upcoming: picks.length > 1 ? 1 : 0 });
  const [spaceDown, setSpaceDown] = useState(false);
  const pick = picks[order.current];

  function clap() {
    setTake((value) => value + 1);
    if (picks.length > 1) {
      const offset = 1 + Math.floor(Math.random() * (picks.length - 1));
      setOrder({ current: order.upcoming, upcoming: (order.upcoming + offset) % picks.length });
    }
  }

  const onSpace = useEffectEvent(clap);

  // Focused controls keep native Space; the slate button already clicks itself.
  useEffect(() => {
    function isPageSpace(event: KeyboardEvent) {
      return (
        event.code === "Space" &&
        !event.altKey &&
        !event.ctrlKey &&
        !event.metaKey &&
        !(event.target instanceof Element &&
          event.target.closest("a, button, input, textarea, select, [contenteditable]"))
      );
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (!isPageSpace(event)) return;
      event.preventDefault();
      setSpaceDown(true);
      if (!event.repeat) onSpace();
    }

    const release = () => setSpaceDown(false);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", release);
    window.addEventListener("blur", release);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", release);
      window.removeEventListener("blur", release);
    };
  }, []);

  return (
    <div className="not-found-layout">
      <div className="not-found-copy">
        <p className="eyebrow">{dictionary.notFoundEyebrow}</p>
        <h1>{dictionary.notFoundTitle}</h1>
        <p className="not-found-description">{dictionary.notFoundCopy}</p>
        {pick && (
          <UpNextCard
            pick={pick}
            upcoming={picks[order.upcoming]}
            take={take}
            locale={locale}
            label={
              take > 1
                ? `${dictionary.slateTake} ${String(take).padStart(2, "0")} · ${dictionary.notFoundUpNext}`
                : dictionary.notFoundUpNext
            }
            episodesLabel={dictionary.episodes}
          />
        )}
        <Link className="not-found-browse" href={`/${locale}#series`}>
          {dictionary.notFoundAction}
          <span className="not-found-browse-count">
            {String(picks.length).padStart(2, "0")}
          </span>
          <span className="not-found-browse-arrow" aria-hidden="true">→</span>
        </Link>
      </div>

      <figure
        className="not-found-stage"
        onPointerMove={trackPointer}
        onPointerLeave={resetPointer}
      >
        <button
          className="slate"
          type="button"
          onClick={clap}
          aria-label={dictionary.slateAction}
          aria-keyshortcuts="Space"
          title={dictionary.slateAction}
        >
          {/* Re-keyed so the clap animation replays. */}
          <span key={take} className={`slate-arm${take > 1 ? " is-clapping" : ""}`} />
          <span className="slate-body">
            <span className="slate-stick" />
            <span className="slate-board" aria-hidden="true">
              <span className="slate-row">
                <span className="slate-label">{dictionary.slateProduction}</span>
                <span className="slate-value">Reelbound</span>
              </span>
              <span className="slate-grid">
                <span className="slate-cell is-scene">
                  <span className="slate-label">{dictionary.slateScene}</span>
                  <span className="slate-value">404</span>
                </span>
                <span className="slate-cell">
                  <span className="slate-label">{dictionary.slateTake}</span>
                  <span className="slate-value">{String(take).padStart(2, "0")}</span>
                </span>
                <span className="slate-cell">
                  <span className="slate-label">{dictionary.slateRoll}</span>
                  <span className="slate-value">A</span>
                </span>
              </span>
              <span className="slate-row">
                <span className="slate-label">{dictionary.slateDirector}</span>
                <span className="slate-value">{dictionary.slateDirectorName}</span>
              </span>
            </span>
          </span>
        </button>
        <figcaption className="not-found-hint">
          <span className="not-found-hint-keyboard">
            {dictionary.slateHintPress}
            <kbd className={spaceDown ? "is-pressed" : undefined}>
              {dictionary.slateHintKey}
            </kbd>
            {dictionary.slateHintAction}
          </span>
          <span className="not-found-hint-touch">{dictionary.slateHintTouch}</span>
        </figcaption>
      </figure>
    </div>
  );
}

function UpNextCard({
  pick,
  upcoming,
  take,
  locale,
  label,
  episodesLabel,
}: {
  pick: NotFoundPick;
  upcoming: NotFoundPick;
  take: number;
  locale: Locale;
  label: string;
  episodesLabel: string;
}) {
  const title = localizedText(pick.title, locale);
  const meta = [
    ...pick.tags.map((tag) => localizedText(tag, locale)),
    `${pick.episodeCount}\u00a0${episodesLabel}`,
  ].join(" · ");
  const cut = take > 1 ? " is-cut" : "";

  return (
    <>
      <Link
        className="up-next-card"
        href={`/${locale}${pick.path}`}
        onPointerEnter={trackSpotlight}
        onPointerMove={trackSpotlight}
      >
        <span key={`poster-${take}`} className={`up-next-poster${cut}`} aria-hidden="true">
          {pick.thumbnail ? (
            <Image src={pick.thumbnail} alt="" fill sizes="96px" />
          ) : (
            <span className="up-next-poster-fallback">{title.slice(0, 1)}</span>
          )}
        </span>
        <span key={`copy-${take}`} className={`up-next-copy${cut}`}>
          <span className="up-next-label">{label}</span>
          <strong>{title}</strong>
          <span className="up-next-meta">{meta}</span>
        </span>
        <span className="episode-nav-arrow up-next-arrow" aria-hidden="true">
          <svg viewBox="0 0 16 16">
            <path d="M3 8h10M9 4l4 4-4 4" />
          </svg>
          <LinkPendingIndicator />
        </span>
      </Link>
      {upcoming.thumbnail && (
        <span className="up-next-preload" aria-hidden="true">
          <Image src={upcoming.thumbnail} alt="" fill sizes="96px" loading="eager" />
        </span>
      )}
      <span className="visually-hidden" aria-live="polite">
        {take > 1 ? `${label}: ${title}` : ""}
      </span>
    </>
  );
}
