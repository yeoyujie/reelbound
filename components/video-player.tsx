"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { EpisodeVideoSource } from "@/data/series";

type VideoPlayerProps = {
  source: EpisodeVideoSource;
  title: string;
};

export function VideoPlayer({ source, title }: VideoPlayerProps) {
  const videoWidth = source.videoWidth ?? 720;
  const videoHeight = source.videoHeight ?? 1280;
  const iframeHeight = videoHeight + 48;
  const frameRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  const playerUrl = new URL("https://open.douyin.com/player/video");
  playerUrl.searchParams.set("vid", source.videoId);
  playerUrl.searchParams.set("autoplay", "1");
  const playerSrc = playerUrl.toString();

  useLayoutEffect(() => {
    const frame = frameRef.current;
    const stage = stageRef.current;
    if (!frame || !stage) return;

    const updateScale = () => {
      const { width, height } = stage.getBoundingClientRect();
      setScale(Math.min(width / videoWidth, height / iframeHeight));
    };

    const observer = new ResizeObserver(updateScale);
    observer.observe(stage);
    window.addEventListener("resize", updateScale);
    updateScale();

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateScale);
    };
  }, [iframeHeight, videoWidth]);

  return (
    <div
      ref={stageRef}
      className="douyin-player-stage"
      style={{ "--iframe-ratio": videoWidth / iframeHeight } as CSSProperties}
    >
      <div
        ref={frameRef}
        className="douyin-frame"
        style={{ width: videoWidth * scale, height: iframeHeight * scale }}
      >
        <iframe
          className="douyin-player"
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
