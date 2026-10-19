import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { cacheLife } from "next/cache";
import { ImageResponse } from "next/og";
import sharp from "sharp";

/**
 * Open Graph cards shown when a Reelbound link is shared in chat apps and
 * social networks. Cards render at build time, so the full CJK font is only a
 * build input and never reaches visitors.
 */

export const shareCardSize = { width: 1200, height: 630 };
export const shareCardContentType = "image/jpeg";

// Dark palette from globals.css. Posters stand out on it in light and dark chats.
const colors = {
  background: "#13151b",
  foreground: "#f1f0ed",
  muted: "#a4a6b0",
  accent: "#afc2f4",
  artwork: "#242936",
};

const POSTER_WIDTH = 450;
const PADDING = 72;

let fontData: Promise<Buffer> | undefined;

function loadFont() {
  fontData ??= readFile(join(process.cwd(), "assets/fonts/NotoSansSC-Bold.otf"));
  return fontData;
}

const imageTypes: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

/** Reads a /public artwork path into a data URI the card renderer can embed. */
async function posterSource(publicPath: string | undefined) {
  if (!publicPath) return undefined;
  const type = imageTypes[extname(publicPath).toLowerCase()];
  if (!type) return undefined;
  const data = await readFile(join(process.cwd(), "public", publicPath));
  return `data:${type};base64,${data.toString("base64")}`;
}

/** Approximate rendered width in em, counting CJK characters as full width. */
function visualLength(text: string) {
  let length = 0;
  for (const char of text) length += /[⺀-鿿＀-￯]/.test(char) ? 1 : 0.5;
  return length;
}

/**
 * Keeps a title on one line when it still reads as a headline; otherwise wraps
 * it over two lines, smaller when long. Avoids a lone character on line two.
 */
function headlineSize(text: string, width: number, max: number) {
  const length = visualLength(text);
  // Leave headroom: digits and capitals run wider than the estimate.
  const oneLine = Math.floor((width * 0.92) / length);
  if (oneLine >= 52) return Math.min(max, oneLine);
  return length > 14 ? 60 : max;
}

// The renderer only emits PNG, which runs 300–750 KB with photo posters. JPEG
// keeps cards well under the size some chat apps accept for previews.
async function renderJpeg(element: React.ReactElement) {
  const response = new ImageResponse(element, {
    ...shareCardSize,
    fonts: [{ name: "Noto Sans SC", data: await loadFont(), weight: 700, style: "normal" }],
  });
  const png = Buffer.from(await response.arrayBuffer());
  return new Uint8Array(await sharp(png).jpeg({ quality: 80, mozjpeg: true }).toBuffer());
}

function imageResponse(image: Uint8Array) {
  return new Response(image as Uint8Array<ArrayBuffer>, {
    headers: { "Content-Type": shareCardContentType },
  });
}

function Wordmark() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <svg width="34" height="34" viewBox="0 0 100 100">
        <g transform="translate(-7.5 -7.5) scale(1.15)" fill={colors.accent}>
          <path d="M18 34 Q18 20 34 18 L75 18 L36 75 Q29 84 18 80 Q18 75 18 65 Z" />
          <path d="M53 85 Q49 89 54 89 L78 89 Q84 89 84 80 L84 46 Q84 42 80 45 Z" />
        </g>
      </svg>
      <span style={{ fontSize: 30, letterSpacing: "-0.05em", color: colors.foreground }}>
        reelbound
      </span>
    </div>
  );
}

function Poster({ src, width }: { src: string | undefined; width: number }) {
  if (!src) {
    // Deliberate fallback for series without artwork, echoing the brand mark.
    return (
      <div
        style={{
          display: "flex",
          width,
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          background: colors.artwork,
        }}
      >
        <svg width="120" height="120" viewBox="0 0 100 100" style={{ opacity: 0.5 }}>
          <g transform="translate(-7.5 -7.5) scale(1.15)" fill={colors.muted}>
            <path d="M18 34 Q18 20 34 18 L75 18 L36 75 Q29 84 18 80 Q18 75 18 65 Z" />
            <path d="M53 85 Q49 89 54 89 L78 89 Q84 89 84 80 L84 46 Q84 42 80 45 Z" />
          </g>
        </svg>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- rendered to PNG, not the DOM
    <img src={src} alt="" width={width} height={shareCardSize.height} style={{ objectFit: "cover" }} />
  );
}

type EpisodeCardOptions = {
  seriesTitle: string;
  episodeLine: string;
  poster: string | undefined;
};

export async function renderEpisodeCard(options: EpisodeCardOptions) {
  return imageResponse(await episodeCardImage(options));
}

// Cards depend only on static catalogue data. Caching the image lets Cache
// Components prerender the image routes despite the font and poster reads.
async function episodeCardImage({ seriesTitle, episodeLine, poster }: EpisodeCardOptions) {
  "use cache";
  cacheLife("max");

  const src = await posterSource(poster);
  const titleSize = headlineSize(seriesTitle, shareCardSize.width - POSTER_WIDTH - PADDING * 2, 76);

  return renderJpeg(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        background: colors.background,
        fontFamily: "Noto Sans SC",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          flex: 1,
          padding: PADDING,
        }}
      >
        <Wordmark />
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div
            style={{
              fontSize: titleSize,
              lineHeight: 1.12,
              letterSpacing: "-0.03em",
              color: colors.foreground,
              lineClamp: 2,
              textWrap: "balance",
            }}
          >
            {seriesTitle}
          </div>
          <div style={{ fontSize: 32, lineHeight: 1.3, color: colors.accent, lineClamp: 2 }}>
            {episodeLine}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", position: "relative", height: "100%" }}>
        <Poster src={src} width={POSTER_WIDTH} />
        {/* Soften the poster's inner edge into the text panel. */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 96,
            height: "100%",
            backgroundImage: `linear-gradient(to right, ${colors.background}, rgba(19, 21, 27, 0))`,
          }}
        />
      </div>
    </div>,
  );
}

type SiteCardOptions = {
  eyebrow: string;
  tagline: string;
  posters: (string | undefined)[];
};

export async function renderSiteCard(options: SiteCardOptions) {
  return imageResponse(await siteCardImage(options));
}

async function siteCardImage({ eyebrow, tagline, posters }: SiteCardOptions) {
  "use cache";
  cacheLife("max");

  const sources = await Promise.all(posters.map(posterSource));
  const posterWidth = 200;
  const taglineSize = headlineSize(
    tagline,
    shareCardSize.width - (posterWidth + 8) * posters.length - PADDING * 2,
    68,
  );

  return renderJpeg(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        background: colors.background,
        fontFamily: "Noto Sans SC",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          flex: 1,
          padding: PADDING,
        }}
      >
        <Wordmark />
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 22,
              letterSpacing: "0.11em",
              textTransform: "uppercase",
              color: colors.muted,
            }}
          >
            {eyebrow}
          </div>
          <div
            style={{
              fontSize: taglineSize,
              textWrap: "balance",
              lineHeight: 1.12,
              letterSpacing: "-0.03em",
              color: colors.foreground,
            }}
          >
            {tagline}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, height: "100%" }}>
        {sources.map((src, index) => (
          <Poster key={index} src={src} width={posterWidth} />
        ))}
      </div>
    </div>,
  );
}
