import { buildSearchIndex } from "@/lib/search-index";

// Reads no request data, so it's prerendered at build time.
export function GET() {
  return Response.json(buildSearchIndex());
}
