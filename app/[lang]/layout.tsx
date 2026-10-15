import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SiteHeader } from "@/components/site-header";
import { InlineScript } from "@/components/inline-script";
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
      {
        default:
          lang === "zh-CN"
            ? "Reelbound — 好故事，值得一看"
            : "Reelbound — Stories worth your time",
        template: "%s — Reelbound",
      },
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
    <html lang={lang} data-theme="dark" suppressHydrationWarning>
      <head>
        <InlineScript
          html={`(function(){try{var t=localStorage.getItem("reelbound-theme")||localStorage.getItem("nextframe-theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`}
        />
      </head>
      <body>
        <SiteHeader locale={lang} dictionary={getDictionary(lang)} />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
