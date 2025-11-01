import type { InspirationAnalysis } from "@/types/aesthetic";

type InspirationInsightsProps = {
  items: InspirationAnalysis[];
};

export function InspirationInsights({ items }: InspirationInsightsProps) {
  if (!items.length) {
    return null;
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <article
          key={item.inspirationId}
          className="rounded-[24px] border border-[rgba(47,47,47,0.06)] bg-white/70 p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.6)]"
        >
          <header className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted">{item.kind === "url" ? "URL" : "Image"}</p>
              <h3 className="mt-1 text-base font-semibold tracking-tight text-[rgba(47,47,47,0.95)]">
                {item.source}
              </h3>
            </div>
            {item.previewUrl ? (
              <a
                href={item.previewUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs uppercase tracking-[0.16em] text-[rgba(138,126,106,1)] underline-offset-4 hover:underline"
              >
                View
              </a>
            ) : null}
          </header>

          <p className="mt-3 text-sm leading-6 text-[rgba(47,47,47,0.85)]">{item.descriptors.summary}</p>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <section className="space-y-2">
              <h4 className="text-xs uppercase tracking-[0.16em] text-muted">Palette</h4>
              <div className="flex flex-wrap gap-3">
                {item.dominantColors.slice(0, 5).map((swatch) => (
                  <span
                    key={`${item.inspirationId}-${swatch.hex}`}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/60 shadow-[0_12px_24px_-12px_rgba(47,47,47,0.35)] text-[10px] uppercase tracking-[0.08em] text-white"
                    style={{ backgroundColor: swatch.hex }}
                    aria-label={`${item.source} swatch ${swatch.hex}`}
                  >
                    {swatch.hex.replace("#", "")}
                  </span>
                ))}
              </div>
            </section>

            <section className="space-y-2">
              <h4 className="text-xs uppercase tracking-[0.16em] text-muted">Mood & Texture</h4>
              <p className="text-sm text-[rgba(47,47,47,0.85)]">{item.descriptors.moodKeywords.join(" · ")}</p>
              <p className="text-xs text-muted">{item.descriptors.textures.join(" · ")}</p>
            </section>
          </div>

          {item.fontCandidates.length ? (
            <section className="mt-4 space-y-1">
              <h4 className="text-xs uppercase tracking-[0.16em] text-muted">Typeface Signals</h4>
              <ul className="space-y-1 text-sm text-[rgba(47,47,47,0.85)]">
                {item.fontCandidates.map((font) => (
                  <li key={`${item.inspirationId}-${font.family}`}>
                    <span className="font-medium">{font.family}</span>
                    <span className="text-muted"> · {font.category}</span>
                    {font.usage ? <span className="text-muted"> · {font.usage}</span> : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {item.tags.length ? (
            <section className="mt-4 space-y-2">
              <h4 className="text-xs uppercase tracking-[0.16em] text-muted">Keywords</h4>
              <ul className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.08em] text-[rgba(92,92,92,0.85)]">
                {item.tags.map((tag) => (
                  <li key={`${item.inspirationId}-${tag}`} className="rounded-full bg-white/80 px-3 py-1 shadow-[0_6px_18px_-12px_rgba(47,47,47,0.45)]">
                    {tag}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </article>
      ))}
    </div>
  );
}

