import { siteUrl } from "@/lib/site-url";
import { version } from "@/package.json";

/*
 * Pre-connection discovery for the MCP server in lib/mcp.ts, following the MCP
 * Server Cards extension (SEP-2127): a Server Card at <endpoint>/server-card
 * and a domain-level AI Catalog at /.well-known/ai-catalog.json pointing to it.
 * https://github.com/modelcontextprotocol/experimental-ext-server-card
 */

export const mcpEndpoint = new URL("/mcp", siteUrl);

const serverCardUrl = new URL("/mcp/server-card", siteUrl);

/** Reverse-DNS name anchored to the deployment's domain, e.g. "app.reelbound/catalog". */
const serverName = `${siteUrl.hostname.split(".").reverse().join(".")}/catalog`;

export const serverCardType = "application/mcp-server-card+json";

export const serverCard = {
  $schema: "https://static.modelcontextprotocol.io/schemas/v1/server-card.schema.json",
  name: serverName,
  version,
  title: "Reelbound",
  description: "Browse, search and get watch links for Reelbound's curated AI-generated series.",
  websiteUrl: siteUrl.href,
  remotes: [
    // supportedProtocolVersions is left out: the SDK exports only its 2025-era
    // versions, and an incomplete list would turn away 2026-era clients. Clients
    // negotiate the version at connection time instead.
    { type: "streamable-http", url: mcpEndpoint.href },
  ],
};

export const aiCatalog = {
  specVersion: "1.0",
  entries: [
    {
      identifier: `urn:air:${siteUrl.hostname}:mcp:catalog`,
      type: serverCardType,
      url: serverCardUrl.href,
    },
  ],
};

/** Discovery documents are public metadata, so any origin may read them. */
export function discoveryResponse(body: unknown, contentType: string) {
  return new Response(JSON.stringify(body), {
    headers: {
      "Content-Type": contentType,
      "Access-Control-Allow-Origin": "*",
    },
  });
}
