type ColorSwatch = {
  hex: string;
  label?: string;
};

type SummaryCardProps = {
  headline: string;
  description: string;
  palette: ColorSwatch[];
  fontDirection: string;
  mood: string[];
  keywords: string[];
};

export function SummaryCard({
  headline,
  description,
  palette,
  fontDirection,
  mood,
  keywords,
}: SummaryCardProps) {
  return (
    <aside className="surface-blue relative h-fit overflow-hidden p-10 lg:sticky lg:top-12">
      <div className="relative z-10 space-y-6">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-white opacity-80" />
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/70">
            Brand DNA
          </p>
        </div>
        <h2 className="text-2xl font-bold leading-tight tracking-tight text-white">
          {headline}
        </h2>
        <p className="text-sm leading-relaxed text-white/80">{description}</p>
      </div>

      <section className="relative z-10 mt-10 space-y-8">
        <div>
          <h3 className="mb-4 text-[10px] font-bold uppercase tracking-[0.28em] text-white/70">
            Palette
          </h3>
          <div className="flex flex-wrap gap-4">
            {palette.map((swatch) => (
              <div key={swatch.hex} className="flex flex-col items-center space-y-2">
                <div
                  className="geometric-circle h-16 w-16 border-white"
                  style={{ backgroundColor: swatch.hex }}
                  aria-label={`Color ${swatch.hex}`}
                />
                <span className="text-[10px] font-mono text-white/90">{swatch.hex}</span>
                {swatch.label ? (
                  <span className="text-[9px] uppercase tracking-wider text-white/60">
                    {swatch.label}
                  </span>
                ) : null}
              </div>
            ))}
            {!palette.length ? (
              <p className="text-sm text-white/60">Swatches appear after analysis.</p>
            ) : null}
          </div>
        </div>

        <div className="space-y-3 border-t-2 border-white/20 pt-6">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/70">
            Font Direction
          </h3>
          <p className="text-sm leading-relaxed text-white/90">{fontDirection}</p>
        </div>

        <div className="space-y-3 border-t-2 border-white/20 pt-6">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/70">Mood</h3>
          <p className="text-sm font-medium text-white/90">
            {mood.length ? mood.join(" · ") : "Mood descriptors will surface after analysis."}
          </p>
        </div>

        <div className="space-y-3 border-t-2 border-white/20 pt-6">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/70">
            Keywords
          </h3>
          {keywords.length ? (
            <ul className="flex flex-wrap gap-2">
              {keywords.map((keyword) => (
                <li
                  key={keyword}
                  className="border-2 border-white bg-transparent px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white"
                >
                  {keyword}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-white/60">Keywords will populate after analysis.</p>
          )}
        </div>
      </section>

      {/* Decorative geometric elements */}
      <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full border-2 border-white opacity-[0.08]" />
      <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full border-2 border-white opacity-[0.08]" />
    </aside>
  );
}

