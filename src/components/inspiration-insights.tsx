import type { InspirationAnalysis } from "@/types/aesthetic";

type InspirationInsightsProps = {
  items: InspirationAnalysis[];
};

export function InspirationInsights({ items }: InspirationInsightsProps) {
  if (!items.length) {
    return null;
  }

  return (
    <div className="space-y-6">
      {items.map((item) => (
        <article
          key={item.inspirationId}
          className="surface-card relative overflow-hidden p-8"
        >
          <header className="relative z-10 flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#1A4D2E]" />
                <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-muted">
                  {item.kind === "url" ? "URL" : "Image"}
                </p>
              </div>
              <h3 className="mt-3 text-base font-bold tracking-tight text-[#0D1E3C]">
                {item.source}
              </h3>
            </div>
            {item.previewUrl ? (
              <a
                href={item.previewUrl}
                target="_blank"
                rel="noreferrer"
                className="border-2 border-[#2A4A8A] bg-transparent px-4 py-2 text-[9px] font-bold uppercase tracking-[0.24em] text-[#2A4A8A] transition-all duration-200 hover:-translate-y-[2px] hover:bg-[#2A4A8A] hover:text-white"
              >
                View
              </a>
            ) : null}
          </header>

          <p className="relative z-10 mt-5 text-sm leading-relaxed text-[#0D1E3C]">
            {item.descriptors.summary}
          </p>

          <div className="relative z-10 mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <section className="space-y-4">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.26em] text-muted">
                Palette
              </h4>
              <div className="flex flex-wrap gap-3">
                {item.dominantColors.slice(0, 5).map((swatch, swatchIndex) => (
                  <div
                    key={`${item.inspirationId}-color-${swatchIndex}`}
                    className="flex flex-col items-center gap-2"
                  >
                    <div
                      className="geometric-circle h-12 w-12 border-[#0D1E3C]"
                      style={{ backgroundColor: swatch.hex }}
                      aria-label={`${item.source} swatch ${swatch.hex}`}
                    />
                    <span className="text-[9px] font-mono text-muted">{swatch.hex}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.26em] text-muted">
                Mood & Texture
              </h4>
              <p className="text-sm font-medium text-[#0D1E3C]">
                {item.descriptors.moodKeywords.join(" · ")}
              </p>
              <p className="text-xs text-muted">{item.descriptors.textures.join(" · ")}</p>
            </section>
          </div>

          {item.fontCandidates.length ? (
            <section className="relative z-10 mt-6 space-y-3 border-t-2 border-[#E0DCD5] pt-6">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.26em] text-muted">
                Typeface Signals
              </h4>
              <ul className="space-y-2 text-sm text-[#0D1E3C]">
                {item.fontCandidates.map((font) => (
                  <li key={`${item.inspirationId}-${font.family}`} className="flex gap-2">
                    <span className="font-bold">{font.family}</span>
                    <span className="text-muted">· {font.category}</span>
                    {font.usage ? <span className="text-muted">· {font.usage}</span> : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {item.tags.length ? (
            <section className="relative z-10 mt-6 space-y-3 border-t-2 border-[#E0DCD5] pt-6">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.26em] text-muted">
                Keywords
              </h4>
              <ul className="flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <li
                    key={`${item.inspirationId}-${tag}`}
                    className="border border-[#C5BEAF] bg-white px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-muted"
                  >
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
