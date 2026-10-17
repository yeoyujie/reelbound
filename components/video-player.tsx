"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { EpisodeVideoSource } from "@/data/series";

const COMPACT_LAYOUT_WIDTH = 800;
const COMPACT_COLUMN_WIDTH = 1000;

type VideoPlayerProps = {
  source: EpisodeVideoSource;
  title: string;
};

export function VideoPlayer({ source, title }: VideoPlayerProps) {
  const reportedWidth = source.videoWidth ?? 720;
  const reportedHeight = source.videoHeight ?? 1280;
  // Constrain ratios above 2:1 to a standard 16:9 player viewport.
  const useStandardWideViewport = reportedWidth / reportedHeight > 2;
  const aspectRatio = useStandardWideViewport
    ? 16 / 9
    : reportedWidth / reportedHeight;
  const stageRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [compact, setCompact] = useState(true);
  const [scale, setScale] = useState(0);
  // The iframe is laid out large and scaled down because Douyin's player falls
  // back to a cramped mobile layout in frames narrower than ~730 px. Keep that
  // layout size small on narrow screens and at most 1080p on wide ones: a 4K
  // frame scaled into a phone-sized stage exhausts memory on iOS.
  const videoWidth = compact
    ? COMPACT_LAYOUT_WIDTH
    : Math.min(Math.max(reportedWidth, COMPACT_LAYOUT_WIDTH), 1920);
  const videoHeight = Math.round(videoWidth / aspectRatio);
  const iframeHeight = videoHeight + 48;
  // Douyin leaves a 12 px theme-colored inset below the player controls.
  const iframeBottomInset = 12;
  const visibleIframeHeight = iframeHeight - iframeBottomInset;
  const playerUrl = new URL("https://open.douyin.com/player/video");
  playerUrl.searchParams.set("vid", source.videoId);
  playerUrl.searchParams.set("autoplay", "1");
  const playerSrc = playerUrl.toString();

  useLayoutEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    if (iframe.src !== playerSrc) iframe.src = playerSrc;

    // Hidden routes stay mounted, unload the player to stop playback.
    return () => {
      iframe.src = "about:blank";
    };
  }, [playerSrc]);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const updateScale = () => {
      const { width, height } = stage.getBoundingClientRect();
      setScale(Math.min(width / videoWidth, height / visibleIframeHeight));
      // The column width does not depend on the player, unlike the stage's.
      const columnWidth = stage.parentElement?.clientWidth ?? width;
      setCompact(columnWidth < COMPACT_COLUMN_WIDTH);
    };

    const observer = new ResizeObserver(updateScale);
    observer.observe(stage);
    if (stage.parentElement) observer.observe(stage.parentElement);
    window.addEventListener("resize", updateScale);
    updateScale();

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateScale);
    };
  }, [videoWidth, visibleIframeHeight]);

  return (
    <div
      ref={stageRef}
      className="douyin-player-stage"
      style={{ "--iframe-ratio": videoWidth / visibleIframeHeight } as CSSProperties}
    >
      <div
        className="douyin-frame"
        style={{ width: videoWidth * scale, height: visibleIframeHeight * scale }}
      >
        <iframe
          className="douyin-player"
          ref={iframeRef}
          src={playerSrc}
          title={`Douyin video: ${title}`}
          width={videoWidth}
          height={iframeHeight}
          style={{
            width: videoWidth,
            height: iframeHeight,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            visibility: scale > 0 ? "visible" : "hidden",
          } as CSSProperties}
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          scrolling="no"
          referrerPolicy="unsafe-url"
          allowFullScreen
        />
      </div>
    </div>
  );
}
