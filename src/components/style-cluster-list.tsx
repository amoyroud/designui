import type { ClusterSummary } from "@/types/aesthetic";

type StyleClusterListProps = {
  clusters: ClusterSummary[];
};

export function StyleClusterList({ clusters }: StyleClusterListProps) {
  if (!clusters.length) {
    return (
      <div className="surface-card border-2 border-dashed p-10 text-center">
        <div className="mx-auto mb-4 h-12 w-12 rounded-full border-2 border-[#C5BEAF] opacity-30" />
        <p className="text-sm text-muted">
          Clusters will appear after analysis, grouping inspirations by shared DNA.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {clusters.map((cluster) => (
        <article
          key={cluster.clusterId}
          className="surface-card relative overflow-hidden p-8"
        >
          <div className="relative z-10 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#2A4A8A]" />
                <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-muted">
                  Cluster
                </p>
              </div>
              <h3 className="mt-3 text-xl font-bold tracking-tight text-[#0D1E3C]">
                {cluster.label}
              </h3>
            </div>
            <span className="border-2 border-[#2A4A8A] bg-transparent px-3 py-1 text-[9px] font-bold uppercase tracking-[0.24em] text-[#2A4A8A]">
              {cluster.members.length}
            </span>
          </div>

          <p className="relative z-10 mt-5 text-sm leading-relaxed text-[#0D1E3C]">
            {cluster.narrative}
          </p>

          <section className="relative z-10 mt-8 space-y-6">
            <div>
              <h4 className="mb-3 text-[10px] font-bold uppercase tracking-[0.26em] text-muted">
                Palette Cues
              </h4>
              <div className="flex flex-wrap gap-3">
                {cluster.palette.slice(0, 6).map((swatch, swatchIndex) => (
                  <div
                    key={`${cluster.clusterId}-color-${swatchIndex}`}
                    className="flex flex-col items-center gap-2"
                  >
                    <div
                      className="geometric-circle h-12 w-12 border-[#0D1E3C]"
                      style={{ backgroundColor: swatch.hex }}
                      aria-label={`Cluster color ${swatch.hex}`}
                    />
                    <span className="text-[10px] font-mono text-muted">{swatch.hex}</span>
                  </div>
                ))}
              </div>
            </div>

            {cluster.fontThemes.length ? (
              <div className="space-y-3 border-t-2 border-[#E0DCD5] pt-4">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.26em] text-muted">
                  Typography Energy
                </h4>
                <ul className="space-y-2 text-sm text-[#0D1E3C]">
                  {cluster.fontThemes.slice(0, 3).map((font) => (
                    <li key={`${cluster.clusterId}-${font.family}`} className="flex gap-2">
                      <span className="font-bold">{font.family}</span>
                      <span className="text-muted">· {font.category}</span>
                      {font.usage ? <span className="text-muted">· {font.usage}</span> : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {cluster.mood.length ? (
              <div className="space-y-3 border-t-2 border-[#E0DCD5] pt-4">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.26em] text-muted">
                  Mood
                </h4>
                <p className="text-sm font-medium text-[#0D1E3C]">
                  {cluster.mood.join(" · ")}
                </p>
              </div>
            ) : null}

            {cluster.keywords.length ? (
              <div className="space-y-3 border-t-2 border-[#E0DCD5] pt-4">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.26em] text-muted">
                  Keywords
                </h4>
                <ul className="flex flex-wrap gap-2">
                  {cluster.keywords.map((keyword) => (
                    <li
                      key={`${cluster.clusterId}-${keyword}`}
                      className="border border-[#C5BEAF] bg-white px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-muted"
                    >
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
