import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveSiteUrl } from "./site-url.ts";

const vercelProduction = {
  VERCEL_ENV: "production",
  VERCEL_PROJECT_PRODUCTION_URL: "reelbound.app",
  VERCEL_BRANCH_URL: "reelbound-git-main.vercel.app",
  VERCEL_URL: "reelbound-abc123.vercel.app",
};

describe("resolveSiteUrl", () => {
  it("prefers an explicit SITE_URL", () => {
    const url = resolveSiteUrl({ ...vercelProduction, SITE_URL: "https://reelbound.tv" });
    assert.equal(url.origin, "https://reelbound.tv");
  });

  it("uses the production domain in production, not the deployment URL", () => {
    assert.equal(resolveSiteUrl(vercelProduction).origin, "https://reelbound.app");
  });

  it("links previews to their stable branch URL", () => {
    const url = resolveSiteUrl({ ...vercelProduction, VERCEL_ENV: "preview" });
    assert.equal(url.origin, "https://reelbound-git-main.vercel.app");
  });

  it("falls back to the deployment URL when there is no branch", () => {
    const url = resolveSiteUrl({ VERCEL_ENV: "preview", VERCEL_URL: "reelbound-abc123.vercel.app" });
    assert.equal(url.origin, "https://reelbound-abc123.vercel.app");
  });

  it("falls back to localhost outside Vercel", () => {
    assert.equal(resolveSiteUrl({}).origin, "http://localhost:3000");
  });

  it("rejects a malformed SITE_URL instead of building broken links", () => {
    assert.throws(() => resolveSiteUrl({ SITE_URL: "reelbound.tv" }));
  });
});
