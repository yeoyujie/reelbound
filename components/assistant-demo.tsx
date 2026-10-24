"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import type { AssistantDemo as Demo } from "@/lib/assistant-demos";

type AssistantDemoProps = {
  demos: Demo[];
  labels: { tryAsking: string; youAsked: string; watch: string };
};

/** The whole question types out in about this long (ms), whatever its length. */
const typingDuration = 850;

/**
 * A sample conversation: pick a question to see the catalogue result an
 * assistant gets back from the MCP server, with a working watch link. With
 * motion allowed, the question types out once the demo is in view, then the
 * answer appears; otherwise, and without JavaScript, everything shows at once.
 */
export function AssistantDemo({ demos, labels }: AssistantDemoProps) {
  const id = useId();
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const rootRef = useRef<HTMLDivElement>(null);
  const [motionAllowed, setMotionAllowed] = useState(false);
  const [inView, setInView] = useState(false);
  const [typing, setTyping] = useState({ index: -1, count: 0 });

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: no-preference)");
    const update = () => setMotionAllowed(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!motionAllowed || !root) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setInView(true);
        observer.disconnect();
      },
      { threshold: 0.5 },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, [motionAllowed]);

  const prompt = Array.from(demos[active]?.prompt ?? "");

  // Type the selected question one character at a time; picking another
  // question cancels this run and starts over.
  useEffect(() => {
    if (!motionAllowed || !inView) return;
    const length = prompt.length;
    const delay = Math.min(65, Math.max(22, typingDuration / length));
    let count = 0;
    const timer = window.setInterval(() => {
      count += 1;
      setTyping({ index: active, count });
      if (count >= length) window.clearInterval(timer);
    }, delay);
    return () => window.clearInterval(timer);
  }, [active, inView, motionAllowed, prompt.length]);

  const typed = !motionAllowed ? prompt.length : typing.index === active ? typing.count : 0;
  const answered = typed >= prompt.length;

  // Arrow keys move between questions and select them (WAI-ARIA tabs pattern).
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const last = demos.length - 1;
    const target = {
      ArrowRight: active === last ? 0 : active + 1,
      ArrowLeft: active === 0 ? last : active - 1,
      Home: 0,
      End: last,
    }[event.key];
    if (target === undefined) return;
    event.preventDefault();
    setActive(target);
    tabRefs.current[target]?.focus();
  }

  if (demos.length === 0) return null;

  return (
    <div className="assistant-demo" ref={rootRef}>
      {/* Ambient colour from the current answer's artwork. */}
      <div className="assistant-ambient" aria-hidden="true">
        {demos.map((demo, index) =>
          demo.artwork ? (
            <Image
              key={demo.href}
              src={demo.artwork}
              alt=""
              fill
              sizes="160px"
              data-active={index === active || undefined}
            />
          ) : null,
        )}
      </div>

      <div
        className="assistant-chips"
        role="tablist"
        aria-label={labels.tryAsking}
        onKeyDown={handleKeyDown}
      >
        {demos.map((demo, index) => (
          <button
            key={demo.href}
            ref={(node) => {
              tabRefs.current[index] = node;
            }}
            type="button"
            role="tab"
            id={`${id}-tab-${index}`}
            className="assistant-chip"
            aria-selected={index === active}
            aria-controls={`${id}-panel-${index}`}
            tabIndex={index === active ? 0 : -1}
            onClick={() => setActive(index)}
          >
            {demo.label}
          </button>
        ))}
      </div>

      {demos.map((demo, index) => (
        <div
          key={demo.href}
          role="tabpanel"
          id={`${id}-panel-${index}`}
          className="assistant-exchange"
          aria-labelledby={`${id}-tab-${index}`}
          hidden={index !== active}
          data-answered={index !== active || answered || undefined}
        >
          <p className="assistant-message">
            <span className="visually-hidden">
              {labels.youAsked}: {demo.prompt}
            </span>
            {/* The full question sizes the bubble so it doesn't grow while typing. */}
            <span className="assistant-message-text" aria-hidden="true">
              <span className="assistant-message-ghost">{demo.prompt}</span>
              <span>
                {index === active ? prompt.slice(0, typed).join("") : demo.prompt}
                {index === active && !answered && <span className="assistant-caret" />}
              </span>
            </span>
          </p>

          <p className="assistant-tool">
            reelbound <span aria-hidden="true">·</span> <code>{demo.tool}</code>
          </p>

          <Link className="assistant-result" href={demo.href}>
            <span className="assistant-result-artwork">
              {demo.artwork ? (
                <Image src={demo.artwork} alt="" fill sizes="(max-width: 600px) 104px, 168px" />
              ) : (
                <span className="assistant-result-fallback">{demo.title}</span>
              )}
            </span>
            <span className="assistant-result-copy">
              <strong>{demo.title}</strong>
              <span className="assistant-result-meta">{demo.meta}</span>
              <span className="assistant-result-description">{demo.description}</span>
              <span className="assistant-result-watch">
                <span className="assistant-result-watch-icon">
                  <svg aria-hidden="true" viewBox="0 0 16 16">
                    <path d="M5 3.5v9l7.5-4.5z" />
                  </svg>
                </span>
                {labels.watch}
              </span>
            </span>
          </Link>
        </div>
      ))}
    </div>
  );
}
