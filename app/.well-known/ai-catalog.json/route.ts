import { aiCatalog, discoveryResponse } from "@/lib/mcp-discovery";

// Reads no request data, so it's prerendered at build time.
export function GET() {
  return discoveryResponse(aiCatalog, "application/ai-catalog+json");
}
