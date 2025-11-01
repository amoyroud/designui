import type { BrandGuideline } from "@/types/aesthetic";

type GuidelinePanelProps = {
  guideline: BrandGuideline;
};

function ColorGroup({
  title,
  swatches,
  startIndex,
}: {
  title: string;
  swatches: BrandGuideline["palette"][keyof BrandGuideline["palette"]];
  startIndex: number;
}) {
  if (!swatches?.length) {
    return null;
  }

  // Determine if text should be light or dark based on color brightness
  const getTextColor = (hex: string) => {
    const rgb = parseInt(hex.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? "#0D1E3C" : "#FFFFFF";
  };

  return (
    <div className="space-y-4">
      <h4 className="text-[10px] font-bold uppercase tracking-[0.26em] text-muted">{title}</h4>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {swatches.map((swatch, swatchIndex) => {
          const textColor = getTextColor(swatch.hex);
          const displayNumber = startIndex + swatchIndex;
          
          return (
            <div
              key={`${title}-color-${swatchIndex}`}
              className="group relative flex aspect-[3/4] flex-col justify-between border-2 border-[#0D1E3C] p-4 transition-all duration-200 hover:-translate-y-1"
              style={{ backgroundColor: swatch.hex }}
              aria-label={`${title} swatch ${swatch.hex}`}
            >
              {/* Large number at top */}
              <span
                className="text-6xl font-bold leading-none"
                style={{ color: textColor }}
              >
                {displayNumber}
              </span>
              
              {/* Color info at bottom */}
              <div className="space-y-1">
                <span
                  className="block text-xs font-mono leading-tight"
                  style={{ color: textColor }}
                >
                  {swatch.hex}
                </span>
                {swatch.usage ? (
                  <span
                    className="block text-[9px] font-bold uppercase tracking-[0.2em] opacity-70"
                    style={{ color: textColor }}
                  >
                    {swatch.usage}
                  </span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FontRow({
  label,
  font,
  index,
}: {
  label: string;
  font?: BrandGuideline["typography"][keyof BrandGuideline["typography"]];
  index: number;
}) {
  if (!font) {
    return null;
  }

  // Get web-safe fallback or Google Font name
  const getFontStack = (family: string) => {
    const lowerFamily = family.toLowerCase();
    
    // Common serif fonts
    if (lowerFamily.includes("serif") && !lowerFamily.includes("sans")) {
      return `"${family}", Georgia, "Times New Roman", serif`;
    }
    
    // Monospace fonts
    if (lowerFamily.includes("mono") || lowerFamily.includes("code")) {
      return `"${family}", "Courier New", Courier, monospace`;
    }
    
    // Sans-serif fonts (default)
    return `"${family}", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`;
  };

  const fontStack = getFontStack(font.family);

  return (
    <div className="border-2 border-[#0D1E3C] bg-white p-8">
      {/* Header with number and category */}
      <div className="mb-6 flex items-baseline gap-4">
        <span className="text-4xl font-bold text-[#0D1E3C]">{index}</span>
        <div className="flex-1">
          <span className="text-[9px] font-bold uppercase tracking-[0.28em] text-muted">
            {label}
          </span>
          <span className="ml-3 text-[9px] uppercase tracking-[0.24em] text-muted-light">
            {font.category}
          </span>
        </div>
      </div>

      {/* Large font name in its own typeface */}
      <div
        className="mb-6 text-5xl font-bold uppercase leading-none tracking-tight text-[#0D1E3C]"
        style={{ fontFamily: fontStack }}
      >
        {font.family}
      </div>

      {/* Specimen text in the font */}
      <div className="space-y-4 border-t-2 border-[#E0DCD5] pt-6">
        <p
          className="text-2xl font-bold leading-tight text-[#0D1E3C]"
          style={{ fontFamily: fontStack }}
        >
          The quick brown fox jumps over the lazy dog
        </p>
        <p
          className="text-base leading-relaxed text-[#0D1E3C]"
          style={{ fontFamily: fontStack }}
        >
          Typography gives structure to language. This section introduces the brand&rsquo;s primary
          typeface, weight usage, and character set.
        </p>
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div>
            <span className="block text-[9px] font-bold uppercase tracking-[0.24em] text-muted">
              Usage
            </span>
            <span className="mt-1 block text-sm text-[#0D1E3C]">
              {font.usage || "General purpose"}
            </span>
          </div>
          {font.fallbackStack ? (
            <div>
              <span className="block text-[9px] font-bold uppercase tracking-[0.24em] text-muted">
                Fallback
              </span>
              <span className="mt-1 block text-[10px] text-muted-light">
                {font.fallbackStack}
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function KeywordPills({ title, items }: { title: string; items: string[] }) {
  if (!items.length) {
    return null;
  }
  return (
    <div className="space-y-3">
      <h4 className="text-[10px] font-bold uppercase tracking-[0.26em] text-muted">{title}</h4>
      <ul className="flex flex-wrap gap-2">
        {items.map((item) => (
          <li
            key={`${title}-${item}`}
            className="border border-[#C5BEAF] bg-white px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-muted"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function GuidelinePanel({ guideline }: GuidelinePanelProps) {
  return (
    <div className="surface-card relative overflow-hidden p-10">
      <section className="relative z-10 space-y-8">
        <div className="flex items-center gap-4 border-b-2 border-[#E0DCD5] pb-4">
          <span className="text-5xl font-bold text-[#0D1E3C]">2.1</span>
          <h3 className="text-2xl font-bold uppercase tracking-tight text-[#0D1E3C]">
            Color
          </h3>
        </div>
        <div className="space-y-10">
          <ColorGroup title="Primary" swatches={guideline.palette.primary} startIndex={1} />
          <ColorGroup
            title="Secondary"
            swatches={guideline.palette.secondary}
            startIndex={1 + (guideline.palette.primary?.length || 0)}
          />
          <ColorGroup
            title="Neutrals"
            swatches={guideline.palette.neutrals}
            startIndex={
              1 +
              (guideline.palette.primary?.length || 0) +
              (guideline.palette.secondary?.length || 0)
            }
          />
          <ColorGroup
            title="Accents"
            swatches={guideline.palette.accents}
            startIndex={
              1 +
              (guideline.palette.primary?.length || 0) +
              (guideline.palette.secondary?.length || 0) +
              (guideline.palette.neutrals?.length || 0)
            }
          />
        </div>
      </section>

      <section className="relative z-10 mt-12 space-y-8">
        <div className="flex items-center gap-4 border-b-2 border-[#E0DCD5] pb-4">
          <span className="text-5xl font-bold text-[#0D1E3C]">3.0</span>
          <h3 className="text-2xl font-bold uppercase tracking-tight text-[#0D1E3C]">
            Typography
          </h3>
        </div>
        <p className="text-sm leading-relaxed text-muted">
          Typography gives structure to language. This section introduces the brand&rsquo;s primary
          typeface, weight usage, and character set to create clear, consistent communication that
          reflects the brand&rsquo;s editorial precision and visual restraint.
        </p>
        <div className="space-y-6">
          <FontRow label="Primary" font={guideline.typography.primary} index={1} />
          <FontRow label="Secondary" font={guideline.typography.secondary} index={2} />
          <FontRow label="Accent" font={guideline.typography.accent} index={3} />
          <FontRow label="Code" font={guideline.typography.code} index={4} />
        </div>
      </section>

      <section className="relative z-10 mt-12 space-y-6">
        <div className="flex items-center gap-4 border-b-2 border-[#E0DCD5] pb-4">
          <span className="text-5xl font-bold text-[#0D1E3C]">4.0</span>
          <h3 className="text-2xl font-bold uppercase tracking-tight text-[#0D1E3C]">
            Imagery Direction
          </h3>
        </div>
        <p className="text-sm leading-relaxed text-[#0D1E3C]">{guideline.imagery.direction}</p>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <KeywordPills title="Treatments" items={guideline.imagery.treatments} />
          <KeywordPills title="Lighting" items={guideline.imagery.lighting} />
          <KeywordPills title="Composition" items={guideline.imagery.composition} />
          <KeywordPills title="Textures" items={guideline.imagery.textureNotes} />
        </div>
      </section>

      <section className="relative z-10 mt-12 space-y-6">
        <div className="flex items-center gap-4 border-b-2 border-[#E0DCD5] pb-4">
          <span className="text-5xl font-bold text-[#0D1E3C]">6.1</span>
          <h3 className="text-2xl font-bold uppercase tracking-tight text-[#0D1E3C]">
            Brand Voice
          </h3>
        </div>
        
        {/* Voice characteristics as numbered list */}
        <div className="space-y-4">
          {guideline.tone.adjectives.slice(0, 3).map((adjective, index) => (
            <div key={`voice-${index}`} className="flex items-baseline gap-4 border-b border-[#E0DCD5] pb-3">
              <span className="text-4xl font-bold text-[#0D1E3C]">{index + 1}</span>
              <span className="text-2xl font-bold uppercase tracking-tight text-[#0D1E3C]">
                {adjective}
              </span>
            </div>
          ))}
        </div>
        
        <div className="mt-8 space-y-6 text-sm">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-muted">
              Description
            </span>
            <p className="mt-2 leading-relaxed text-[#0D1E3C]">{guideline.tone.voice}</p>
          </div>
          <KeywordPills title="Messaging Pillars" items={guideline.tone.messagingPillars} />
        </div>
      </section>

      <section className="relative z-10 mt-12 space-y-6">
        <div className="flex items-center gap-4 border-b-2 border-[#E0DCD5] pb-4">
          <span className="text-5xl font-bold text-[#0D1E3C]">8.0</span>
          <h3 className="text-2xl font-bold uppercase tracking-tight text-[#0D1E3C]">
            Summary
          </h3>
        </div>
        <p className="text-sm leading-relaxed text-[#0D1E3C]">{guideline.summary}</p>
        <KeywordPills title="Core Keywords" items={guideline.keywords} />
      </section>
    </div>
  );
}
