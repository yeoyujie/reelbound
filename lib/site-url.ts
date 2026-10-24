type Env = Partial<Record<string, string>>;

/**
 * The site's canonical origin, used wherever an absolute URL is required:
 * metadata (canonical, hreflang, Open Graph images) and MCP watch links.
 *
 * `SITE_URL` wins when set; set it for Production only, so previews keep their
 * own origin. Otherwise Vercel's system variables give the production domain
 * or the preview's stable branch URL, and local builds fall back to localhost.
 */
export function resolveSiteUrl(env: Env): URL {
  if (env.SITE_URL) return new URL(env.SITE_URL);

  if (env.VERCEL_ENV === "production" && env.VERCEL_PROJECT_PRODUCTION_URL) {
    return new URL(`https://${env.VERCEL_PROJECT_PRODUCTION_URL}`);
  }

  const deployment = env.VERCEL_BRANCH_URL ?? env.VERCEL_URL;
  if (deployment) return new URL(`https://${deployment}`);

  return new URL("http://localhost:3000");
}

export const siteUrl = resolveSiteUrl(process.env);
