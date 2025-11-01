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
  isEmpty?: boolean;
};

export function SummaryCard({
  headline,
  description,
  palette,
  fontDirection,
  mood,
  keywords,
  isEmpty,
}: SummaryCardProps) {
  return (
    <aside className="surface-card h-fit rounded-[32px] bg-white/70 p-8 backdrop-blur-md lg:sticky lg:top-12">
      <div className="space-y-4">
        <p className="text-xs uppercase tracking-[0.28em] text-muted">Brand DNA</p>
        <h2 className="text-2xl font-semibold tracking-tight text-[rgba(47,47,47,0.95)]">
          {headline}
        </h2>
        <p className="text-sm leading-6 text-muted">{description}</p>
      </div>

      <section className="mt-8 space-y-6">
        <div>
          <h3 className="text-xs uppercase tracking-[0.24em] text-muted">Palette</h3>
          <div className="mt-3 flex flex-wrap gap-4">
            {palette.map((swatch) => (
              <div key={swatch.hex} className="flex flex-col items-center space-y-2 text-xs text-muted">
                <span
                  className="h-12 w-12 rounded-full border border-white/60 shadow-[0_12px_24px_-12px_rgba(47,47,47,0.35)]"
                  style={{ backgroundColor: swatch.hex }}
                  aria-label={`Color ${swatch.hex}`}
                />
                <span className="font-medium text-[rgba(47,47,47,0.75)]">{swatch.hex}</span>
                {swatch.label ? <span>{swatch.label}</span> : null}
              </div>
            ))}
            {!palette.length ? (
              <p className="text-sm text-muted">Swatches appear after analysis.</p>
            ) : null}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-xs uppercase tracking-[0.24em] text-muted">Font Direction</h3>
          <p className="text-sm text-[rgba(47,47,47,0.85)]">{fontDirection}</p>
        </div>

        <div className="space-y-2">
          <h3 className="text-xs uppercase tracking-[0.24em] text-muted">Mood</h3>
          <p className="text-sm text-[rgba(47,47,47,0.85)]">
            {mood.length ? mood.join(" · ") : "Mood descriptors will surface after analysis."}
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="text-xs uppercase tracking-[0.24em] text-muted">Keywords</h3>
          {keywords.length ? (
            <ul className="flex flex-wrap gap-2 text-sm text-[rgba(47,47,47,0.85)]">
              {keywords.map((keyword) => (
                <li
                  key={keyword}
                  className="rounded-full bg-white/80 px-3 py-1 text-xs tracking-[0.08em] uppercase text-muted shadow-[0_6px_18px_-12px_rgba(47,47,47,0.45)]"
                >
                  {keyword}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">Keywords will populate after uploads are analyzed.</p>
          )}
        </div>
      </section>

      {isEmpty ? (
        <p className="mt-10 text-xs text-muted">
          Add a few inspirations to generate a living brand aesthetic summary. We will surface
          palette, typography direction, mood, and key descriptors once analysis runs.
        </p>
      ) : null}
    </aside>
  );
}

