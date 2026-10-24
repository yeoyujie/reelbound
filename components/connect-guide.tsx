"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { CopySnippet } from "@/components/copy-snippet";
import type { Dictionary, Locale } from "@/lib/i18n";

type ConnectGuideProps = {
  /** The MCP server's Streamable HTTP endpoint. */
  url: string;
  locale: Locale;
  dictionary: Pick<
    Dictionary,
    | "connectServerUrl"
    | "connectCopy"
    | "linkCopied"
    | "connectChooseClient"
    | "connectOther"
    | "connectClaudeSteps"
    | "connectOpenClaude"
    | "connectChatgptSteps"
    | "connectChatgptNote"
    | "connectOpenChatgpt"
    | "connectRunCommand"
    | "connectOrConfig"
    | "connectAddToCursor"
    | "connectAddToVscode"
    | "connectOneClickNote"
    | "connectOrCommand"
    | "connectOtherCopy"
    | "connectKimiNote"
    | "connectKimiSteps"
    | "connectDeepseekNote"
    | "connectAddConfig"
  >;
};

const clients = [
  "claude",
  "chatgpt",
  "claude-code",
  "codex",
  "cursor",
  "vscode",
  "kimi-code",
  "deepseek-harness",
  "other",
] as const;
type Client = (typeof clients)[number];

// Claude and ChatGPT aren't generally available in mainland China, so Chinese
// visitors start with the Chinese assistants.
const clientOrder: Record<Locale, readonly Client[]> = {
  en: clients,
  "zh-CN": ["kimi-code", "deepseek-harness", "claude-code", "codex", "cursor", "vscode", "claude", "chatgpt", "other"],
};

function isClient(value: string): value is Client {
  return clients.includes(value as Client);
}

const serverName = "reelbound";

/**
 * Per-assistant setup for the MCP server: one tab per client, selectable by
 * URL hash (e.g. /connect#cursor) so a specific guide can be shared.
 */
export function ConnectGuide({ url, locale, dictionary }: ConnectGuideProps) {
  const order = clientOrder[locale];
  const [active, setActive] = useState<Client>(order[0]);
  const tabRefs = useRef(new Map<Client, HTMLButtonElement>());

  useEffect(() => {
    const syncFromHash = () => {
      const hash = window.location.hash.slice(1);
      if (isClient(hash)) setActive(hash);
    };
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  // Keep the selected tab visible in the scrollable tab row, e.g. after a hash link.
  useEffect(() => {
    tabRefs.current.get(active)?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [active]);

  function select(client: Client, { focus = false } = {}) {
    setActive(client);
    window.history.replaceState(null, "", `#${client}`);
    if (focus) tabRefs.current.get(client)?.focus();
  }

  // Arrow keys move between tabs and select them (WAI-ARIA tabs pattern).
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const index = order.indexOf(active);
    const target = {
      ArrowRight: order[(index + 1) % order.length],
      ArrowLeft: order[(index - 1 + order.length) % order.length],
      Home: order[0],
      End: order[order.length - 1],
    }[event.key];
    if (!target) return;
    event.preventDefault();
    select(target, { focus: true });
  }

  const names: Record<Client, string> = {
    claude: "Claude",
    chatgpt: "ChatGPT",
    "claude-code": "Claude Code",
    codex: "Codex",
    cursor: "Cursor",
    vscode: "VS Code",
    "kimi-code": "Kimi Code",
    "deepseek-harness": "DeepSeek Harness",
    other: dictionary.connectOther,
  };

  const snippet = (caption: string, value: string) => (
    <CopySnippet
      caption={caption}
      value={value}
      copyLabel={dictionary.connectCopy}
      copiedLabel={dictionary.linkCopied}
    />
  );

  const steps = (items: string[]) => (
    <ol className="connect-steps">
      {items.map((step) => (
        <li key={step}>{step}</li>
      ))}
    </ol>
  );

  const orConfig = (file: string) => dictionary.connectOrConfig.replace("{file}", file);
  const addConfig = (file: string) => dictionary.connectAddConfig.replace("{file}", file);

  const mcpJsonConfig = JSON.stringify({ mcpServers: { [serverName]: { url } } }, null, 2);
  const vscodeServer = JSON.stringify({ name: serverName, type: "http", url });

  const panels: Record<Client, ReactNode> = {
    claude: (
      <>
        {steps(dictionary.connectClaudeSteps)}
        <a
          className="connect-action"
          href="https://claude.ai/customize/connectors"
          target="_blank"
          rel="noopener noreferrer"
        >
          {dictionary.connectOpenClaude}
          <span aria-hidden="true">↗</span>
        </a>
      </>
    ),
    chatgpt: (
      <>
        {steps(dictionary.connectChatgptSteps)}
        <p className="connect-note">{dictionary.connectChatgptNote}</p>
        <a
          className="connect-action"
          href="https://chatgpt.com/plugins"
          target="_blank"
          rel="noopener noreferrer"
        >
          {dictionary.connectOpenChatgpt}
          <span aria-hidden="true">↗</span>
        </a>
      </>
    ),
    "claude-code": snippet(
      dictionary.connectRunCommand,
      `claude mcp add --transport http ${serverName} ${url}`,
    ),
    codex: (
      <>
        {snippet(dictionary.connectRunCommand, `codex mcp add ${serverName} --url ${url}`)}
        {snippet(orConfig("~/.codex/config.toml"), `[mcp_servers.${serverName}]\nurl = "${url}"`)}
      </>
    ),
    cursor: (
      <>
        <a
          className="connect-action is-primary"
          href={`cursor://anysphere.cursor-deeplink/mcp/install?name=${serverName}&config=${btoa(JSON.stringify({ url }))}`}
        >
          {dictionary.connectAddToCursor}
        </a>
        <p className="connect-note">{dictionary.connectOneClickNote}</p>
        {snippet(orConfig("~/.cursor/mcp.json"), mcpJsonConfig)}
      </>
    ),
    vscode: (
      <>
        <a
          className="connect-action is-primary"
          href={`vscode:mcp/install?${encodeURIComponent(vscodeServer)}`}
        >
          {dictionary.connectAddToVscode}
        </a>
        <p className="connect-note">{dictionary.connectOneClickNote}</p>
        {snippet(dictionary.connectOrCommand, `code --add-mcp '${vscodeServer}'`)}
      </>
    ),
    "kimi-code": (
      <>
        <p className="connect-panel-copy">{dictionary.connectKimiNote}</p>
        {steps(dictionary.connectKimiSteps)}
        {snippet(orConfig("~/.kimi-code/mcp.json"), mcpJsonConfig)}
      </>
    ),
    "deepseek-harness": (
      <>
        <p className="connect-panel-copy">{dictionary.connectDeepseekNote}</p>
        {snippet(
          addConfig("$DSH_HOME/cordis.patch.yml"),
          [
            "- insert:",
            `    - id: mcp-${serverName}`,
            "      name: '@deepseek-ai/dsh-mcp-client'",
            "      config:",
            `        serverName: ${serverName}`,
            "        transport: streamable-http",
            `        url: ${url}`,
          ].join("\n"),
        )}
      </>
    ),
    other: <p className="connect-panel-copy">{dictionary.connectOtherCopy}</p>,
  };

  return (
    <div className="connect-guide">
      {snippet(dictionary.connectServerUrl, url)}

      <div className="connect-tabs">
        <div
          className="connect-tablist"
          role="tablist"
          aria-label={dictionary.connectChooseClient}
          onKeyDown={handleKeyDown}
        >
          {order.map((client) => (
            <button
              key={client}
              ref={(node) => {
                if (node) tabRefs.current.set(client, node);
                else tabRefs.current.delete(client);
              }}
              type="button"
              role="tab"
              id={`connect-tab-${client}`}
              className="connect-tab"
              aria-selected={client === active}
              aria-controls={`connect-panel-${client}`}
              tabIndex={client === active ? 0 : -1}
              onClick={() => select(client)}
            >
              {names[client]}
            </button>
          ))}
        </div>

        {order.map((client) => (
          <div
            key={client}
            role="tabpanel"
            id={`connect-panel-${client}`}
            className="connect-panel"
            aria-labelledby={`connect-tab-${client}`}
            hidden={client !== active}
            tabIndex={0}
          >
            {panels[client]}
          </div>
        ))}
      </div>
    </div>
  );
}
