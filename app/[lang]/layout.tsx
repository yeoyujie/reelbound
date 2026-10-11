import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SiteHeader } from "@/components/site-header";
import type { Metadata } from "next";
import { getDictionary, isLocale, locales } from "@/lib/i18n";
import { notFound } from "next/navigation";
import "../globals.css";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dictionary = getDictionary(lang);

  return {
    title:
      lang === "zh-CN"
        ? "NextFrame — 故事正在发生"
        : "NextFrame — Stories in motion",
    description: dictionary.introCopy,
    alternates: {
      languages: {
        en: "/en",
        "zh-CN": "/zh-CN",
      },
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return (
    <html lang={lang}>
      <body>
        <SiteHeader locale={lang} dictionary={getDictionary(lang)} />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
