import { mcpHandler } from "@/lib/mcp";

export function GET(request: Request) {
  return mcpHandler.fetch(request);
}

export function POST(request: Request) {
  return mcpHandler.fetch(request);
}

export function DELETE(request: Request) {
  return mcpHandler.fetch(request);
}
