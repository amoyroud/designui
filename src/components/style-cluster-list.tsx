import type { ClusterSummary } from "@/types/aesthetic";

type StyleClusterListProps = {
  clusters: ClusterSummary[];
};

export function StyleClusterList({ clusters }: StyleClusterListProps) {
  if (!clusters.length) {
    return (
      <div className="rounded-[24px] border border-dashed border-[rgba(47,47,47,0.08)] bg-white/40 p-8 text-sm text-muted">
        Clusters will appear after analysis, grouping inspirations by shared DNA.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {clusters.map((cluster) => (
        <article
          key={cluster.clusterId}
          className="rounded-[24px] border border-[rgba(47,47,47,0.06)] bg-white/70 p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.6)]"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-muted">Cluster</p>
              <h3 className="mt-2 text-xl font-semibold tracking-tight text-[rgba(47,47,47,0.95)]">
                {cluster.label}
              </h3>
            </div>
            <span className="rounded-full bg-[rgba(138,126,106,0.12)] px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-[rgba(138,126,106,1)]">
              {cluster.members.length} refs
            </span>
          </div>

          <p className="mt-4 text-sm leading-6 text-[rgba(47,47,47,0.85)]">{cluster.narrative}</p>

          <section className="mt-6 space-y-4">
            <div>
              <h4 className="text-xs uppercase tracking-[0.18em] text-muted">Palette cues</h4>
              <div className="mt-3 flex flex-wrap gap-3">
                {cluster.palette.slice(0, 6).map((swatch) => (
                  <div key={`${cluster.clusterId}-${swatch.hex}`} className="flex flex-col items-center text-xs text-muted">
                    <span
                      className="h-10 w-10 rounded-full border border-white/60 shadow-[0_12px_24px_-12px_rgba(47,47,47,0.35)]"
                      style={{ backgroundColor: swatch.hex }}
                      aria-label={`Cluster color ${swatch.hex}`}
                    />
                    <span className="mt-1 font-medium text-[rgba(47,47,47,0.75)]">{swatch.hex}</span>
                  </div>
                ))}
              </div>
            </div>

            {cluster.fontThemes.length ? (
              <div className="space-y-2">
                <h4 className="text-xs uppercase tracking-[0.18em] text-muted">Typography energy</h4>
                <ul className="space-y-1 text-sm text-[rgba(47,47,47,0.85)]">
                  {cluster.fontThemes.slice(0, 3).map((font) => (
                    <li key={`${cluster.clusterId}-${font.family}`}>
                      <span className="font-medium">{font.family}</span>
                      <span className="text-muted"> · {font.category}</span>
                      {font.usage ? <span className="text-muted"> · {font.usage}</span> : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {cluster.mood.length ? (
              <div className="space-y-2">
                <h4 className="text-xs uppercase tracking-[0.18em] text-muted">Mood</h4>
                <p className="text-sm text-[rgba(47,47,47,0.85)]">{cluster.mood.join(" · ")}</p>
              </div>
            ) : null}

            {cluster.keywords.length ? (
              <div className="space-y-2">
                <h4 className="text-xs uppercase tracking-[0.18em] text-muted">Keywords</h4>
                <ul className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.08em] text-[rgba(92,92,92,0.85)]">
                  {cluster.keywords.map((keyword) => (
                    <li key={`${cluster.clusterId}-${keyword}`} className="rounded-full bg-white/80 px-3 py-1 shadow-[0_6px_18px_-12px_rgba(47,47,47,0.45)]">
                      {keyword}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>
        </article>
      ))}
    </div>
  );
}

