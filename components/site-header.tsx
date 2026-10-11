"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Dictionary, Locale } from "@/lib/i18n";

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

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link className="wordmark" href={`/${locale}`} aria-label={dictionary.home}>
          <span className="wordmark-icon" aria-hidden="true">
            <span />
          </span>
          <span>nextframe</span>
        </Link>

        <div className="header-actions">
          <p className="header-descriptor">{dictionary.headerDescriptor}</p>
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
