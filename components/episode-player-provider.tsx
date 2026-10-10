"use client";

import {
  createContext,
  useContext,
  useLayoutEffect,
  useState,
  type ReactNode,
} from "react";
import type { EpisodeVideoSource } from "@/data/series";
import { VideoPlayer } from "@/components/video-player";

type ActiveEpisodeSource = {
  source: EpisodeVideoSource;
  title: string;
};

type EpisodePlayerContextValue = {
  setEpisodeSource: (episode: ActiveEpisodeSource) => void;
};

const EpisodePlayerContext = createContext<EpisodePlayerContextValue | null>(
  null,
);

export function EpisodePlayerProvider({ children }: { children: ReactNode }) {
  const [resolvedEpisode, setResolvedEpisode] =
    useState<ActiveEpisodeSource | null>(null);

  return (
    <EpisodePlayerContext.Provider
      value={{ setEpisodeSource: setResolvedEpisode }}
    >
      <section className="watch-main" aria-labelledby="episode-title">
        {resolvedEpisode ? (
          <VideoPlayer
            source={resolvedEpisode.source}
            title={resolvedEpisode.title}
          />
        ) : (
          <div className="player-stage" aria-hidden="true" />
        )}
        {children}
      </section>
    </EpisodePlayerContext.Provider>
  );
}

export function EpisodePlayerSourceSync({
  source,
  title,
}: ActiveEpisodeSource) {
  const context = useContext(EpisodePlayerContext);

  if (!context) {
    throw new Error(
      "EpisodePlayerSourceSync must be inside EpisodePlayerProvider",
    );
  }

  const { setEpisodeSource } = context;
  useLayoutEffect(() => {
    setEpisodeSource({ source, title });
  }, [setEpisodeSource, source, title]);

  return null;
}
