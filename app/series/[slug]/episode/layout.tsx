import type { ReactNode } from "react";
import { EpisodeSidebar } from "@/components/episode-sidebar";
import { EpisodePlayerProvider } from "@/components/episode-player-provider";

export default function EpisodeLayout({ children }: { children: ReactNode }) {
  return (
    <main className="watch-shell">
      <div className="watch-layout">
        <EpisodePlayerProvider>{children}</EpisodePlayerProvider>
        <EpisodeSidebar />
      </div>
    </main>
  );
}
