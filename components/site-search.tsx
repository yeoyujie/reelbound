"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useDeferredValue,
  useEffect,
  useEffectEvent,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent,
} from "react";
import type { Dictionary, Locale } from "@/lib/i18n";
import {
  highlight,
  searchCatalog,
  snippet,
  type SearchIndex,
  type SearchIndexSeries,
  type SearchLanguage,
  type SearchResult,
} from "@/lib/search";

type SiteSearchProps = {
  locale: Locale;
  dictionary: Dictionary;
};

let indexRequest: Promise<SearchIndex> | undefined;

/** Fetches the index once per page load; a failed request can be retried. */
function loadSearchIndex() {
  indexRequest ??= fetch("/search-index.json")
    .then((response) => {
      if (!response.ok) throw new Error(`Search index responded ${response.status}`);
      return response.json() as Promise<SearchIndex>;
    })
    .catch((error: unknown) => {
      indexRequest = undefined;
      throw error;
    });

  return indexRequest;
}

/** Warms the index on hover, focus or touch; opening the palette reports failures. */
function prefetchSearchIndex() {
  loadSearchIndex().catch(() => {});
}

function isEditable(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || target.matches("input, textarea, select"))
  );
}

function Highlighted({ text, query }: { text: string; query: string }) {
  return highlight(text, query).map((part, index) =>
    part.match ? <mark key={index}>{part.text}</mark> : part.text,
  );
}

function SearchArtwork({ series, language }: { series: SearchIndexSeries; language: SearchLanguage }) {
  return (
    <span className="search-artwork" aria-hidden="true">
      {series.thumbnail ? (
        <Image src={series.thumbnail} alt="" fill sizes="96px" />
      ) : (
        <span className="search-artwork-fallback">{Array.from(series.title[language])[0]}</span>
      )}
    </span>
  );
}

/** Explains a match that isn't visible in the title, e.g. the other language or the description. */
function matchContext(result: SearchResult, title: string, language: SearchLanguage, query: string) {
  const { match } = result;
  const titleShowsMatch = highlight(title, query).some((part) => part.match);
  if (match.field === "title" && match.language !== language && !titleShowsMatch) {
    const title = result.kind === "series" ? result.series.title : result.episode.title;
    return title?.[match.language];
  }
  if (match.field === "description") {
    const description =
      result.kind === "series" ? result.series.description : result.episode.description;
    return description && snippet(description[match.language], query);
  }
  return undefined;
}

function resultHref(result: SearchResult, locale: Locale) {
  const episode = result.kind === "series" ? result.series.entryEpisode : result.episode.slug;
  return `/${locale}/series/${result.series.slug}/episode/${episode}`;
}

export function SiteSearch({ locale, dictionary }: SiteSearchProps) {
  const pathname = usePathname();
  const language: SearchLanguage = locale === "zh-CN" ? "zh" : "en";
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const optionRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const id = useId();
  const listboxId = `${id}-listbox`;

  const [index, setIndex] = useState<SearchIndex>();
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const deferredQuery = useDeferredValue(query);

  const results = useMemo(
    () => (index ? searchCatalog(index, deferredQuery) : undefined),
    [index, deferredQuery],
  );
  const options: SearchResult[] = results ? [...results.series, ...results.episodes] : [];
  const active = options.length > 0 ? Math.min(activeIndex, options.length - 1) : -1;
  const hasQuery = deferredQuery.trim().length > 0;

  const genres = useMemo(() => {
    const labels = index?.series.flatMap((series) => series.tags.map((tag) => tag[language]));
    return [...new Set(labels)];
  }, [index, language]);

  function requestIndex() {
    setFailed(false);
    loadSearchIndex().then(setIndex, () => setFailed(true));
  }

  function openSearch() {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
    if (!index) requestIndex();
    // Keep the last query, selected, so typing replaces it.
    inputRef.current?.focus();
    inputRef.current?.select();
  }

  function closeSearch() {
    dialogRef.current?.close();
  }

  function changeQuery(value: string) {
    setQuery(value);
    setActiveIndex(0);
  }

  const onShortcut = useEffectEvent((event: KeyboardEvent) => {
    if (event.defaultPrevented || event.isComposing) return;
    const commandK =
      (event.metaKey || event.ctrlKey) && !event.altKey && event.key.toLowerCase() === "k";
    const slash =
      event.key === "/" && !event.metaKey && !event.ctrlKey && !event.altKey && !isEditable(event.target);
    if (!commandK && !slash) return;

    event.preventDefault();
    openSearch();
  });

  useEffect(() => {
    window.addEventListener("keydown", onShortcut);
    return () => window.removeEventListener("keydown", onShortcut);
  }, []);

  // Covers back/forward navigation while the palette is open.
  useEffect(() => {
    dialogRef.current?.close();
  }, [pathname]);

  useEffect(() => {
    if (active >= 0) optionRefs.current[active]?.scrollIntoView({ block: "nearest" });
  }, [active]);

  function handleKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    // Keys pressed while an input method is composing (e.g. pinyin) belong to it.
    if (event.nativeEvent.isComposing || event.keyCode === 229) {
      if (event.key === "Escape") event.preventDefault();
      return;
    }

    switch (event.key) {
      case "ArrowDown":
      case "ArrowUp": {
        event.preventDefault();
        if (options.length === 0) return;
        const step = event.key === "ArrowDown" ? 1 : -1;
        setActiveIndex((active + step + options.length) % options.length);
        break;
      }
      case "Enter":
        event.preventDefault();
        if (active >= 0) optionRefs.current[active]?.click();
        break;
      case "Escape":
        // Stops search inputs clearing themselves instead of closing.
        event.preventDefault();
        closeSearch();
        break;
    }
  }

  function handleOptionClick(event: MouseEvent) {
    // Let new-tab and new-window clicks keep the palette open.
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    closeSearch();
  }

  const status = failed
    ? dictionary.searchError
    : !results
      ? dictionary.searchLoading
      : !hasQuery
        ? ""
        : options.length === 1
          ? dictionary.searchResultCountOne
          : dictionary.searchResultCount.replace("{count}", `${options.length}`);

  function renderOption(result: SearchResult, position: number) {
    const optionId = `${id}-option-${position}`;
    const seriesTitle = result.series.title[language];
    const title =
      result.kind === "series"
        ? seriesTitle
        : (result.episode.title?.[language] ?? result.episode.label[language]);
    const context = matchContext(result, title, language, deferredQuery);
    const meta =
      result.kind === "series"
        ? [...result.series.tags.map((tag) => tag[language]), `${result.series.episodeCount} ${dictionary.episodes}`]
        : [seriesTitle, ...(result.episode.title ? [result.episode.label[language]] : [])];

    return (
      <div
        key={optionId}
        id={optionId}
        role="option"
        aria-selected={position === active}
        className="search-option"
        onPointerMove={() => position !== active && setActiveIndex(position)}
      >
        <Link
          ref={(node) => {
            optionRefs.current[position] = node;
          }}
          href={resultHref(result, locale)}
          tabIndex={-1}
          onClick={handleOptionClick}
        >
          <SearchArtwork series={result.series} language={language} />
          <span className="search-option-text">
            <span className="search-option-title">
              <Highlighted text={title} query={deferredQuery} />
            </span>
            <span className="search-option-meta">
              {context ? <Highlighted text={context} query={deferredQuery} /> : meta.join(" · ")}
            </span>
          </span>
          <span className="search-option-enter" aria-hidden="true">
            ↵
          </span>
        </Link>
      </div>
    );
  }

  return (
    <>
      <button
        className="search-trigger"
        type="button"
        onClick={openSearch}
        onPointerEnter={prefetchSearchIndex}
        onPointerDown={prefetchSearchIndex}
        onFocus={prefetchSearchIndex}
        aria-haspopup="dialog"
        aria-keyshortcuts="/ Control+K Meta+K"
        aria-label={dictionary.searchLabel}
        title={dictionary.searchLabel}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="6.5" />
          <path d="m16 16 4.5 4.5" />
        </svg>
        <span className="search-trigger-label">{dictionary.search}</span>
        <kbd className="search-trigger-key" aria-hidden="true">
          /
        </kbd>
      </button>

      <dialog
        ref={dialogRef}
        className="search-dialog"
        aria-label={dictionary.searchLabel}
        onClick={(event) => {
          // The dialog element itself is only hit through its backdrop.
          if (event.target === event.currentTarget) closeSearch();
        }}
      >
        <div className="search-panel">
          <div className="search-field">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="6.5" />
              <path d="m16 16 4.5 4.5" />
            </svg>
            <input
              ref={inputRef}
              type="search"
              role="combobox"
              aria-label={dictionary.searchLabel}
              aria-expanded={options.length > 0}
              aria-controls={listboxId}
              aria-autocomplete="list"
              aria-activedescendant={active >= 0 ? `${id}-option-${active}` : undefined}
              placeholder={dictionary.searchPlaceholder}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              enterKeyHint="go"
              value={query}
              onChange={(event) => changeQuery(event.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button className="search-cancel" type="button" onClick={closeSearch}>
              {dictionary.searchCancel}
            </button>
          </div>

          <div className="search-body">
            <div id={listboxId} role="listbox" aria-label={dictionary.searchLabel}>
              {results && results.series.length > 0 && (
                <div role="group" aria-labelledby={`${id}-series`}>
                  <div id={`${id}-series`} className="search-group-label">
                    {hasQuery ? dictionary.searchSeriesGroup : dictionary.searchAllSeries}
                  </div>
                  {results.series.map((result, position) => renderOption(result, position))}
                </div>
              )}
              {results && results.episodes.length > 0 && (
                <div role="group" aria-labelledby={`${id}-episodes`}>
                  <div id={`${id}-episodes`} className="search-group-label">
                    {dictionary.searchEpisodesGroup}
                  </div>
                  {results.episodes.map((result, position) =>
                    renderOption(result, results.series.length + position),
                  )}
                </div>
              )}
            </div>

            {!results && !failed && <p className="search-message">{dictionary.searchLoading}</p>}

            {failed && (
              <div className="search-message">
                <p>{dictionary.searchError}</p>
                <button className="search-chip" type="button" onClick={requestIndex}>
                  {dictionary.searchRetry}
                </button>
              </div>
            )}

            {results && options.length === 0 && (
              <div className="search-message">
                <p>{dictionary.searchNoResults.replace("{query}", deferredQuery.trim())}</p>
                {genres.length > 0 && (
                  <>
                    <p className="search-group-label">{dictionary.searchTryGenre}</p>
                    <div className="search-chips">
                      {genres.map((genre) => (
                        <button
                          key={genre}
                          className="search-chip"
                          type="button"
                          onClick={() => {
                            changeQuery(genre);
                            inputRef.current?.focus();
                          }}
                        >
                          {genre}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="search-footer" aria-hidden="true">
            <span>
              <kbd>↑</kbd>
              <kbd>↓</kbd> {dictionary.searchHintMove}
            </span>
            <span>
              <kbd>↵</kbd> {dictionary.searchHintOpen}
            </span>
            <span>
              <kbd>esc</kbd> {dictionary.searchHintClose}
            </span>
          </div>

          <p className="visually-hidden" role="status">
            {status}
          </p>
        </div>
      </dialog>
    </>
  );
}
