import { ConnectGuide } from "@/components/connect-guide";
import { getDictionary, isLocale, localeAlternates } from "@/lib/i18n";
import { mcpEndpoint } from "@/lib/mcp-discovery";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/connect">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dictionary = getDictionary(lang);

  return {
    title: dictionary.connectLink,
    description: dictionary.connectMetaDescription,
    alternates: localeAlternates(lang, "/connect"),
  };
}

export default async function ConnectPage({ params }: PageProps<"/[lang]/connect">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dictionary = getDictionary(lang);

  return (
    <main className="connect-shell">
      <header className="connect-intro">
        <p className="eyebrow">{dictionary.connectEyebrow}</p>
        <h1>{dictionary.connectTitle}</h1>
        <p className="connect-lede">{dictionary.connectLede}</p>
        <ul className="connect-facts">
          {dictionary.connectFacts.map((fact) => (
            <li key={fact}>{fact}</li>
          ))}
        </ul>
      </header>

      <ConnectGuide url={mcpEndpoint.href} locale={lang} dictionary={dictionary} />

      <section className="connect-prompts" aria-labelledby="connect-prompts-heading">
        <h2 id="connect-prompts-heading" className="eyebrow">
          {dictionary.connectTryAsking}
        </h2>
        <ul>
          {dictionary.connectPrompts.map((prompt) => (
            <li key={prompt}>{prompt}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
