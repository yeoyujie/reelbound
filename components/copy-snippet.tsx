"use client";

import { useEffect, useId, useRef, useState } from "react";

type CopySnippetProps = {
  /** Visible caption; it also describes the copy button to screen readers. */
  caption: string;
  value: string;
  copyLabel: string;
  copiedLabel: string;
};

/** A caption, a value in monospace and a copy button, e.g. a URL or a terminal command. */
export function CopySnippet({ caption, value, copyLabel, copiedLabel }: CopySnippetProps) {
  const captionId = useId();
  const valueRef = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      // Leave the value selected so it can be copied by hand.
      const node = valueRef.current;
      const selection = window.getSelection();
      if (!node || !selection) return;
      const range = document.createRange();
      range.selectNodeContents(node);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }

  return (
    <div className="copy-snippet">
      <p className="copy-snippet-caption" id={captionId}>
        {caption}
      </p>
      <div className="copy-snippet-body">
        <pre className="copy-snippet-value" data-multiline={value.includes("\n") || undefined}>
          <code ref={valueRef}>{value}</code>
        </pre>
        <button
          type="button"
          className="copy-snippet-button"
          onClick={copy}
          aria-describedby={captionId}
          data-copied={copied || undefined}
        >
          <svg aria-hidden="true" viewBox="0 0 16 16">
            {copied ? (
              <path d="m3 8.5 3 3 7-7" />
            ) : (
              <path d="M5.5 5.5V3h7.5v7.5h-2.5M3 5.5h7.5V13H3z" />
            )}
          </svg>
          {copied ? copiedLabel : copyLabel}
        </button>
      </div>
      <span className="visually-hidden" aria-live="polite">
        {copied ? copiedLabel : ""}
      </span>
    </div>
  );
}
