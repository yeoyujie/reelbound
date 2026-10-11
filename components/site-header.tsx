"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useSyncExternalStore } from "react";
import type { Dictionary, Locale } from "@/lib/i18n";

function getThemeSnapshot() {
  const explicitTheme = document.documentElement.dataset.theme;
  return explicitTheme
    ? explicitTheme === "dark"
    : window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function subscribeToTheme(onChange: () => void) {
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
  const syncSystemTheme = () => {
    if (!document.documentElement.dataset.theme) onChange();
  };

  systemTheme.addEventListener("change", syncSystemTheme);
  window.addEventListener("nextframe-theme-change", onChange);
  return () => {
    systemTheme.removeEventListener("change", syncSystemTheme);
    window.removeEventListener("nextframe-theme-change", onChange);
  };
}

export function SiteHeader({
  locale,
  dictionary,
}: {
  locale: Locale;
  dictionary: Dictionary;
}) {
  const pathname = usePathname();
  const alternateLocale = locale === "en" ? "zh-CN" : "en";
  const alternatePath = pathname
    ? pathname.replace(/^\/(?:en|zh-CN)(?=\/|$)/, `/${alternateLocale}`)
    : `/${alternateLocale}`;
  const isDark = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, () => false);

  useLayoutEffect(() => {
    try {
      const savedTheme = window.localStorage.getItem("nextframe-theme");
      if (
        (savedTheme === "light" || savedTheme === "dark") &&
        document.documentElement.dataset.theme !== savedTheme
      ) {
        document.documentElement.dataset.theme = savedTheme;
        window.dispatchEvent(new Event("nextframe-theme-change"));
      }
    } catch {
      // The system preference remains active when browser storage is unavailable.
    }
  }, [pathname]);

  function toggleTheme() {
    const nextTheme = isDark ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    try {
      window.localStorage.setItem("nextframe-theme", nextTheme);
    } catch {
      // The current page still changes theme when browser storage is unavailable.
    }
    window.dispatchEvent(new Event("nextframe-theme-change"));
  }

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link className="wordmark" href={`/${locale}`} aria-label={dictionary.home}>
          <svg className="wordmark-icon" aria-hidden="true" viewBox="0 0 100 100">
            <g transform="translate(-7.5 -7.5) scale(1.15)" fill="var(--accent-primary)">
              <path
                d="M18 34 Q18 20 34 18 L75 18 L36 75 Q29 84 18 80 Q18 75 18 65 Z"
              />
              <path d="M53 85 Q49 89 54 89 L78 89 Q84 89 84 80 L84 46 Q84 42 80 45 Z" />
            </g>
          </svg>
          <span>nextframe</span>
        </Link>

        <div className="header-actions">
          <p className="header-descriptor">{dictionary.headerDescriptor}</p>
          <button
            className="theme-toggle"
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? dictionary.switchToLightMode : dictionary.switchToDarkMode}
            title={isDark ? dictionary.switchToLightMode : dictionary.switchToDarkMode}
          >
            {isDark ? (
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="3.5" />
                <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
              </svg>
            ) : (
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
                <path d="M20.2 15.4A8.5 8.5 0 0 1 8.6 3.8 8.5 8.5 0 1 0 20.2 15.4Z" />
              </svg>
            )}
          </button>
          <nav className="language-toggle" aria-label="Language">
            <Link
              className={`language-toggle-option${locale === "en" ? " is-active" : ""}`}
              href={locale === "en" ? pathname ?? "/en" : alternatePath}
              aria-current={locale === "en" ? "page" : undefined}
            >
              English
            </Link>
            <Link
              className={`language-toggle-option${locale === "zh-CN" ? " is-active" : ""}`}
              href={locale === "zh-CN" ? pathname ?? "/zh-CN" : alternatePath}
              aria-current={locale === "zh-CN" ? "page" : undefined}
            >
              中文
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
