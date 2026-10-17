import { Suspense, type ReactNode } from "react";
import { EpisodeSidebar } from "@/components/episode-sidebar";
import { EpisodeDetailsSkeleton } from "@/components/episode-details-skeleton";
import { EpisodePlayerProvider } from "@/components/episode-player-provider";
import { EpisodeScrollReset } from "@/components/episode-scroll-reset";

export default function EpisodeLayout({ children }: { children: ReactNode }) {
  return (
    <main className="watch-shell">
      <EpisodeScrollReset />
      <div className="watch-layout">
        <EpisodePlayerProvider>
          {/* Shared across episodes: once revealed, switching episodes keeps the
              current details on screen until the next episode is ready. */}
          <Suspense fallback={<EpisodeDetailsSkeleton />}>{children}</Suspense>
        </EpisodePlayerProvider>
        <EpisodeSidebar />
      </div>
    </main>
  );
}
