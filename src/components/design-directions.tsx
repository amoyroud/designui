import type { DesignDirection } from "@/types/aesthetic";
import type { ProjectProfile } from "@/types/aesthetic";

type DesignDirectionsProps = {
  directions: DesignDirection[];
  projectProfile?: ProjectProfile;
};

export function DesignDirections({ directions, projectProfile }: DesignDirectionsProps) {
  if (!directions || directions.length === 0) {
    return null;
  }

  const hasProjectProfile = Boolean(
    projectProfile?.contextNotes || projectProfile?.siteUrl || projectProfile?.siteSummary,
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-4 border-b-2 border-[#E0DCD5] pb-4">
          <span className="text-5xl font-bold text-[#0D1E3C]">5.0</span>
          <h2 className="text-2xl font-bold uppercase tracking-tight text-[#0D1E3C]">
            Design Directions
          </h2>
        </div>
        {hasProjectProfile && (
          <div className="surface-card p-6">
            <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.28em] text-muted">
              Your Project
            </h3>
            <div className="space-y-3 text-sm leading-relaxed text-[#0D1E3C]">
              {projectProfile?.contextNotes ? <p>{projectProfile.contextNotes}</p> : null}
              {projectProfile?.siteUrl ? (
                <p className="text-xs text-muted">
                  Reference site: {" "}
                  <a href={projectProfile.siteUrl} className="underline" target="_blank" rel="noreferrer">
                    {projectProfile.siteUrl}
                  </a>
                </p>
              ) : null}
              {projectProfile?.siteSummary ? <p className="text-xs text-muted">{projectProfile.siteSummary}</p> : null}
            </div>
          </div>
        )}
        <p className="text-sm leading-relaxed text-muted">
          Based on your project profile and visual inspirations, we have generated{" "}
          <strong>{directions.length}</strong> distinct design directions for your landing page.
          Each applies your brand DNA in a unique way.
        </p>
      </div>

      {/* Directions Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 xl:grid-cols-3">
        {directions.map((direction, index) => (
          <article
            key={direction.id}
            className="surface-card group relative flex flex-col overflow-hidden transition-all duration-200 hover:-translate-y-[3px]"
          >
            {/* Direction Number Badge */}
            <div className="absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#2A4A8A] bg-white">
              <span className="text-xl font-bold text-[#2A4A8A]">{index + 1}</span>
            </div>

            {/* Color Preview Bar */}
            <div className="flex h-24" style={{ backgroundColor: direction.colorApplication.hero }}>
              <div className="flex-1" style={{ backgroundColor: direction.colorApplication.background }} />
              <div className="flex-1" style={{ backgroundColor: direction.colorApplication.accent }} />
              <div className="flex-1" style={{ backgroundColor: direction.colorApplication.text }} />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-1 flex-col space-y-6 p-8">
              {/* Header */}
              <div>
                <h3 className="text-2xl font-bold uppercase tracking-tight text-[#0D1E3C]">
                  {direction.concept}
                </h3>
                <p className="mt-2 text-sm font-medium italic text-muted">{direction.tagline}</p>
              </div>

              {/* Description */}
              <p className="text-sm leading-relaxed text-[#0D1E3C]">{direction.description}</p>

              {/* Hero Section Preview */}
              <div className="space-y-3 border-t-2 border-[#E0DCD5] pt-6">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.28em] text-muted">
                  Hero Section
                </h4>
                <div className="space-y-2">
                  <p
                    className="text-lg font-bold leading-tight text-[#0D1E3C]"
                    style={{ fontFamily: direction.typographyApplication.headline.family }}
                  >
                    {direction.heroSection.headline}
                  </p>
                  <p className="text-sm text-muted">{direction.heroSection.subheadline}</p>
                  <div className="inline-flex items-center border-2 border-[#2A4A8A] bg-transparent px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-[#2A4A8A]">
                    {direction.heroSection.ctaText}
                  </div>
                </div>
              </div>

              {/* Typography */}
              <div className="space-y-3 border-t-2 border-[#E0DCD5] pt-6">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.28em] text-muted">
                  Typography
                </h4>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-bold">Headline:</span>{" "}
                    {direction.typographyApplication.headline.family}
                  </p>
                  <p>
                    <span className="font-bold">Body:</span> {direction.typographyApplication.body.family}
                  </p>
                  <p className="text-xs text-muted">{direction.typographyApplication.hierarchy}</p>
                </div>
              </div>

              {/* Color Application */}
              <div className="space-y-3 border-t-2 border-[#E0DCD5] pt-6">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.28em] text-muted">
                  Color Application
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="block font-bold">Hero</span>
                    <div className="mt-1 flex items-center gap-2">
                      <div
                        className="h-6 w-6 border-2 border-[#0D1E3C]"
                        style={{ backgroundColor: direction.colorApplication.hero }}
                      />
                      <span className="font-mono text-muted">{direction.colorApplication.hero}</span>
                    </div>
                  </div>
                  <div>
                    <span className="block font-bold">Background</span>
                    <div className="mt-1 flex items-center gap-2">
                      <div
                        className="h-6 w-6 border-2 border-[#0D1E3C]"
                        style={{ backgroundColor: direction.colorApplication.background }}
                      />
                      <span className="font-mono text-muted">{direction.colorApplication.background}</span>
                    </div>
                  </div>
                  <div>
                    <span className="block font-bold">Accent</span>
                    <div className="mt-1 flex items-center gap-2">
                      <div
                        className="h-6 w-6 border-2 border-[#0D1E3C]"
                        style={{ backgroundColor: direction.colorApplication.accent }}
                      />
                      <span className="font-mono text-muted">{direction.colorApplication.accent}</span>
                    </div>
                  </div>
                  <div>
                    <span className="block font-bold">Text</span>
                    <div className="mt-1 flex items-center gap-2">
                      <div
                        className="h-6 w-6 border-2 border-[#0D1E3C]"
                        style={{ backgroundColor: direction.colorApplication.text }}
                      />
                      <span className="font-mono text-muted">{direction.colorApplication.text}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Features */}
              <div className="space-y-3 border-t-2 border-[#E0DCD5] pt-6">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.28em] text-muted">
                  Key Features
                </h4>
                <ul className="space-y-1 text-sm">
                  {direction.keyFeatures.map((feature, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-[#2A4A8A]">•</span>
                      <span className="text-[#0D1E3C]">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Why This Works */}
              <div className="space-y-3 border-t-2 border-[#E0DCD5] pt-6">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.28em] text-muted">
                  Why This Works
                </h4>
                <p className="text-sm leading-relaxed text-[#0D1E3C]">{direction.reasoning}</p>
              </div>

              {/* Layout & CTA Strategy */}
              <div className="space-y-4 border-t-2 border-[#E0DCD5] pt-6">
                <div>
                  <h4 className="mb-2 text-[10px] font-bold uppercase tracking-[0.28em] text-muted">
                    Layout Style
                  </h4>
                  <p className="text-sm text-[#0D1E3C]">{direction.layoutStyle}</p>
                </div>
                <div>
                  <h4 className="mb-2 text-[10px] font-bold uppercase tracking-[0.28em] text-muted">
                    CTA Strategy
                  </h4>
                  <div className="space-y-1 text-xs text-[#0D1E3C]">
                    <p>
                      <span className="font-bold">Style:</span> {direction.ctaStrategy.style}
                    </p>
                    <p>
                      <span className="font-bold">Placement:</span> {direction.ctaStrategy.placement}
                    </p>
                    <p>
                      <span className="font-bold">Tone:</span> {direction.ctaStrategy.tone}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

