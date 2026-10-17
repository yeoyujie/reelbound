/** Holds the episode details and navigation layout until an episode first renders. */
export function EpisodeDetailsSkeleton() {
  return (
    <>
      <div className="episode-details" aria-hidden="true">
        <div className="episode-heading">
          <p className="episode-kicker">
            <span className="skeleton-text" style={{ width: 160 }} />
          </p>
          <p className="episode-title-skeleton">
            <span className="skeleton-text" style={{ width: 280 }} />
          </p>
        </div>
        <p className="episode-description">
          <span className="skeleton-text" style={{ width: "100%" }} />
          <span className="skeleton-text" style={{ width: "100%" }} />
          <span className="skeleton-text" style={{ width: "48%" }} />
        </p>
      </div>

      <div className="episode-navigation" aria-hidden="true">
        {(["prev", "next"] as const).map((rel) => (
          <div key={rel} className={`episode-nav-link is-${rel} is-skeleton`}>
            <span className="episode-nav-arrow" />
            <span className="episode-nav-copy">
              <span className="episode-nav-direction">
                <span className="skeleton-text" style={{ width: 88 }} />
              </span>
              <strong>
                <span className="skeleton-text" style={{ width: 200 }} />
              </strong>
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
