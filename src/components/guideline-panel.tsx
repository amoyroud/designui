import type { BrandGuideline } from "@/types/aesthetic";

type GuidelinePanelProps = {
  guideline: BrandGuideline;
};

function ColorGroup({ title, swatches }: { title: string; swatches: BrandGuideline["palette"][keyof BrandGuideline["palette"]]; }) {
  if (!swatches?.length) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h4 className="text-xs uppercase tracking-[0.18em] text-muted">{title}</h4>
      <div className="flex flex-wrap gap-3">
        {swatches.map((swatch) => (
          <div key={`${title}-${swatch.hex}`} className="flex flex-col items-center text-xs text-muted">
            <span
              className="h-12 w-12 rounded-full border border-white/70 shadow-[0_18px_30px_-18px_rgba(47,47,47,0.45)]"
              style={{ backgroundColor: swatch.hex }}
              aria-label={`${title} swatch ${swatch.hex}`}
            />
            <span className="mt-1 font-medium text-[rgba(47,47,47,0.8)]">{swatch.hex}</span>
            {swatch.usage ? <span>{swatch.usage}</span> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function FontRow({ label, font }: { label: string; font?: BrandGuideline["typography"][keyof BrandGuideline["typography"]]; }) {
  if (!font) {
    return null;
  }

  return (
    <div className="flex flex-col rounded-[20px] border border-[rgba(47,47,47,0.06)] bg-white/80 px-4 py-3 text-sm text-[rgba(47,47,47,0.85)] shadow-[0_12px_30px_-20px_rgba(47,47,47,0.35)]">
      <span className="text-xs uppercase tracking-[0.16em] text-muted">{label}</span>
      <span className="mt-1 text-base font-medium text-[rgba(47,47,47,0.95)]">{font.family}</span>
      <span className="text-xs text-muted">{font.category}{font.usage ? ` · ${font.usage}` : ""}</span>
      {font.fallbackStack ? <span className="text-[11px] text-muted">Fallback: {font.fallbackStack}</span> : null}
    </div>
  );
}

function KeywordPills({ title, items }: { title: string; items: string[] }) {
  if (!items.length) {
    return null;
  }
  return (
    <div className="space-y-3">
      <h4 className="text-xs uppercase tracking-[0.18em] text-muted">{title}</h4>
      <ul className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.08em] text-[rgba(92,92,92,0.85)]">
        {items.map((item) => (
          <li key={`${title}-${item}`} className="rounded-full bg-white/80 px-3 py-1 shadow-[0_6px_18px_-12px_rgba(47,47,47,0.45)]">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function GuidelinePanel({ guideline }: GuidelinePanelProps) {
  return (
    <div className="space-y-10 rounded-[32px] border border-[rgba(47,47,47,0.08)] bg-white/80 p-8 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.7)]">
      <section className="space-y-6">
        <h3 className="text-sm font-medium uppercase tracking-[0.2em] text-muted">Palette Architecture</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <ColorGroup title="Primary" swatches={guideline.palette.primary} />
          <ColorGroup title="Secondary" swatches={guideline.palette.secondary} />
          <ColorGroup title="Neutrals" swatches={guideline.palette.neutrals} />
          <ColorGroup title="Accents" swatches={guideline.palette.accents} />
        </div>
      </section>

      <section className="space-y-6">
        <h3 className="text-sm font-medium uppercase tracking-[0.2em] text-muted">Typography Stack</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FontRow label="Primary" font={guideline.typography.primary} />
          <FontRow label="Secondary" font={guideline.typography.secondary} />
          <FontRow label="Accent" font={guideline.typography.accent} />
          <FontRow label="Code" font={guideline.typography.code} />
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-medium uppercase tracking-[0.2em] text-muted">Imagery Direction</h3>
        <p className="text-sm leading-6 text-[rgba(47,47,47,0.85)]">{guideline.imagery.direction}</p>
        <KeywordPills title="Treatments" items={guideline.imagery.treatments} />
        <KeywordPills title="Lighting" items={guideline.imagery.lighting} />
        <KeywordPills title="Composition" items={guideline.imagery.composition} />
        <KeywordPills title="Textures" items={guideline.imagery.textureNotes} />
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-medium uppercase tracking-[0.2em] text-muted">Voice & Messaging</h3>
        <div className="space-y-3 text-sm text-[rgba(47,47,47,0.85)]">
          <p>
            <span className="font-medium text-[rgba(47,47,47,0.95)]">Voice:&nbsp;</span>
            {guideline.tone.voice}
          </p>
          <KeywordPills title="Adjectives" items={guideline.tone.adjectives} />
          <KeywordPills title="Messaging Pillars" items={guideline.tone.messagingPillars} />
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-medium uppercase tracking-[0.2em] text-muted">Guideline Summary</h3>
        <p className="text-sm leading-6 text-[rgba(47,47,47,0.85)]">{guideline.summary}</p>
        <KeywordPills title="Keywords" items={guideline.keywords} />
      </section>
    </div>
  );
}

