"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Dropzone } from "@/components/dropzone";
import { SummaryCard } from "@/components/summary-card";
import { ThumbnailGrid } from "@/components/thumbnail-grid";
import { StyleClusterList } from "@/components/style-cluster-list";
import { GuidelinePanel } from "@/components/guideline-panel";
import { InspirationInsights } from "@/components/inspiration-insights";
import { DesignDirections } from "@/components/design-directions";
import type { ThumbnailItem } from "@/components/thumbnail-grid";
import type { AnalyzeResponse, InspirationKind, UploadResponse } from "@/types/aesthetic";

type UploadItem = {
  id: string;
  kind: InspirationKind;
  name: string;
  status: "pending" | "analyzed" | "failed";
  previewUrl?: string;
  sizeLabel?: string;
  file?: File;
  url?: string;
  serverId?: string;
};

const generateUploadId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `upload-${Date.now()}-${Math.round(Math.random() * 1_000_000)}`;
};

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function HomeShell() {
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [analysis, setAnalysis] = useState<AnalyzeResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);
  const [projectContext, setProjectContext] = useState("");
  const [projectUrl, setProjectUrl] = useState("");
  const [projectUrlError, setProjectUrlError] = useState<string | null>(null);
  const previewUrlRegistry = useRef(new Set<string>());

  const placeholderPalette = useMemo(
    () => [
      { hex: "#F8F1E8" },
      { hex: "#CFC0B2" },
      { hex: "#A5907A" },
      { hex: "#5E5548" },
      { hex: "#2F2A26" },
    ],
    [],
  );

  const handleFilesSelected = useCallback((files: File[]) => {
    setUploads((current) => {
      const existingKeys = new Set(
        current
          .filter((item): item is UploadItem & { file: File } => item.kind === "image" && Boolean(item.file))
          .map((item) => `${item.name}-${item.file.size}`),
      );
      const nextItems: UploadItem[] = [];

      files.forEach((file) => {
        const key = `${file.name}-${file.size}`;
        if (existingKeys.has(key)) {
          return;
        }

        const previewUrl = URL.createObjectURL(file);
        previewUrlRegistry.current.add(previewUrl);

        nextItems.push({
          id: generateUploadId(),
          kind: "image",
          name: file.name,
          previewUrl,
          sizeLabel: formatFileSize(file.size),
          status: "pending",
          file,
        });
      });

      return [...current, ...nextItems];
    });
  }, []);

  const handleRemove = useCallback((id: string) => {
    setUploads((current) => {
      const target = current.find((item) => item.id === id);
      if (target?.previewUrl && target.kind === "image") {
        previewUrlRegistry.current.delete(target.previewUrl);
        URL.revokeObjectURL(target.previewUrl);
      }

      return current.filter((item) => item.id !== id);
    });
  }, []);

  const handleUrlSubmit = useCallback(
    (event?: FormEvent<HTMLFormElement>) => {
      event?.preventDefault();

      const candidate = urlInput.trim();
      if (!candidate) {
        return;
      }

      let parsed: URL;

      try {
        parsed = new URL(candidate);
      } catch {
        setUrlError("Enter a valid URL (https://example.com)");
        return;
      }

      const normalized = parsed.toString();
      const hostname = parsed.hostname.replace(/^www\./, "");

      setUploads((current) => {
        const exists = current.some((item) => item.kind === "url" && item.url === normalized);
        if (exists) {
          return current;
        }

        const id = generateUploadId();

        return [
          ...current,
          {
            id,
            kind: "url",
            name: hostname || normalized,
            url: normalized,
            status: "pending",
            previewUrl: "/window.svg",
            sizeLabel: "URL",
          },
        ];
      });

      setUrlInput("");
      setUrlError(null);
    },
    [urlInput],
  );

  const handleAnalyze = useCallback(async () => {
    if (!uploads.length) {
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const normalizedProjectUrl = projectUrl.trim();
      let validatedProjectUrl: string | undefined;

      if (normalizedProjectUrl) {
        try {
          const parsed = new URL(normalizedProjectUrl);
          validatedProjectUrl = parsed.toString();
          setProjectUrlError(null);
        } catch {
          setProjectUrlError("Enter a valid URL (https://example.com)");
          throw new Error("Invalid project URL");
        }
      }

      const formData = new FormData();
      const manifest = uploads.map((upload) => ({
        clientId: upload.id,
        kind: upload.kind,
        name: upload.name,
        url: upload.kind === "url" ? upload.url : undefined,
      }));

      formData.append("manifest", JSON.stringify(manifest));

      uploads.forEach((upload) => {
        if (upload.kind === "image" && upload.file) {
          formData.append("files", upload.file, upload.name);
        }
      });

      const uploadResponse = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Upload step failed");
      }

      const { uploadIds } = (await uploadResponse.json()) as UploadResponse;

      const analyzeResponse = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inspirationIds: uploadIds,
          projectContext: projectContext.trim() || undefined,
          projectUrl: validatedProjectUrl,
        }),
      });

      if (!analyzeResponse.ok) {
        throw new Error("Analysis step failed");
      }

      const analyzePayload = (await analyzeResponse.json()) as AnalyzeResponse;
      setAnalysis(analyzePayload);

      setUploads((current) =>
        current.map((item, index) => ({
          ...item,
          serverId: uploadIds[index] ?? item.serverId,
          status: "analyzed",
        })),
      );
    } catch (err) {
      if (err instanceof Error && err.message === "Invalid project URL") {
        // URL error already surfaced to user via projectUrlError state
      } else {
        setError(
          err instanceof Error
            ? err.message
            : "We couldn’t complete the analysis. Please try again.",
        );
      }
    } finally {
      setIsAnalyzing(false);
    }
  }, [uploads, projectContext, projectUrl]);

  const handleResetAnalysis = useCallback(() => {
    setAnalysis(null);
    setUploads((current) =>
      current.map((item) => ({
        ...item,
        status: "pending",
      })),
    );
  }, []);

  const thumbnailItems = useMemo<ThumbnailItem[]>(
    () =>
      uploads.map(({ id, name, previewUrl, sizeLabel, status, kind, url }) => ({
        id,
        name,
        previewUrl,
        sizeLabel,
        status,
        kind,
        href: url,
      })),
    [uploads],
  );

  const summaryHeadline = analysis ? "Brand Aesthetic Summary" : "Awaiting inspiration";
  const summaryDescription =
    analysis?.synthesis.narrative ??
    "Once we study your references, we will articulate a focused brand aesthetic.";
  const summaryPalette = analysis
    ? analysis.synthesis.palette.map((hex) => ({ hex }))
    : placeholderPalette;
  const summaryFontDirection =
    analysis?.synthesis.fontDirection ?? "Calm geometric sans with softened terminals.";
  const summaryMood = analysis?.synthesis.mood ?? ["Warm", "Composed", "Textural"];
  const summaryKeywords =
    analysis?.synthesis.keywords ?? ["cream", "soft contrast", "tactile", "artisanal", "modern"];

  useEffect(() => {
    const registry = previewUrlRegistry.current;

    return () => {
      registry.forEach((url) => URL.revokeObjectURL(url));
      registry.clear();
    };
  }, []);

  return (
    <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1280px] flex-col gap-16 px-6 pb-32 pt-16 lg:flex-row lg:gap-16 lg:px-12 lg:pt-24">
      <div className="flex w-full flex-col gap-16 lg:w-2/3">
        <header className="relative space-y-8">
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-[#2A4A8A]" />
            <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-muted">
              Reverse Moodboard Engine
            </p>
          </div>
          <h1 className="relative max-w-2xl text-5xl font-bold leading-[1.1] tracking-tight text-[#0D1E3C]">
            Drop your inspiration.
            <br />
            Distill the aesthetic DNA.
          </h1>
          <div className="relative">
            <p className="max-w-xl text-base leading-relaxed text-muted">
              Upload brand fragments, product shots, or mood imagery. We will synthesize the shared
              palette, typography energy, textures, and emotional tone into a concise creative
              direction.
            </p>
            {/* Geometric accent */}
            <div className="absolute -left-4 top-0 h-full w-1 bg-gradient-to-b from-[#4A6FA5] to-transparent opacity-30" />
          </div>
        </header>

        {/* Project Context Input */}
        <section className="surface-card relative space-y-8 p-8">
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-[#2A4A8A]" />
            <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted">
              Project Context
            </h2>
          </div>
          <div className="space-y-8">
            <div className="space-y-3">
              <label htmlFor="project-context" className="block text-sm font-medium text-[#0D1E3C]">
                Describe your product, service, or project
              </label>
              <p className="text-xs text-muted">Outline what you make, who it’s for, and the experience you want to deliver.</p>
              <textarea
                id="project-context"
                value={projectContext}
                onChange={(e) => setProjectContext(e.target.value)}
                placeholder="Example: B2B SaaS platform for design teams. We help product designers collaborate on prototypes in real-time. Target audience: Design leads at tech companies with 50-500 employees. Our existing site is minimal and technical."
                className="w-full border-2 border-[#C5BEAF] bg-white px-6 py-4 text-sm leading-relaxed text-[#0D1E3C] outline-none transition-all duration-200 focus:border-[#4A6FA5] focus:-translate-y-[1px]"
                rows={5}
                disabled={isAnalyzing}
              />
            </div>

            <div className="space-y-3">
              <label htmlFor="project-url" className="block text-sm font-medium text-[#0D1E3C]">
                Existing website URL
              </label>
              <p className="text-xs text-muted">We’ll review it to understand your positioning, tone, and visual style.</p>
              <input
                id="project-url"
                type="url"
                value={projectUrl}
                onChange={(event) => {
                  setProjectUrl(event.target.value);
                  if (projectUrlError) {
                    setProjectUrlError(null);
                  }
                }}
                placeholder="https://yourbrand.com"
                className="w-full border-2 border-[#C5BEAF] bg-white px-6 py-3 text-sm text-[#0D1E3C] outline-none transition-all duration-200 focus:border-[#4A6FA5] focus:-translate-y-[1px]"
                disabled={isAnalyzing}
              />
              {projectUrlError ? (
                <p className="text-xs text-red-600">{projectUrlError}</p>
              ) : (
                <p className="text-xs text-muted">Optional, but helps us match your voice and vibe.</p>
              )}
            </div>

            <div className="rounded-[12px] border border-[#E0DCD5] bg-white/70 px-5 py-4">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#4A6FA5]">Quick tip</p>
              <ul className="mt-3 space-y-1 text-xs text-muted">
                <li>• Mention your target audience and the feeling you want to evoke.</li>
                <li>• Highlight differentiators or keywords we should weave into directions.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="surface-card relative space-y-8 p-8">
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-[#2A4A8A]" />
            <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted">Inspiration</h2>
          </div>

          <div className="space-y-10">
            <Dropzone onFilesSelected={handleFilesSelected} disabled={isAnalyzing} isAnalyzing={isAnalyzing} />

            <div className="relative">
              <div className="h-px w-full bg-[#E0DCD5]" />
              <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-[10px] font-bold uppercase tracking-[0.3em] text-muted">
                Or paste a link
              </span>
            </div>

            <div className="space-y-3">
              <form className="flex flex-col gap-4 sm:flex-row" onSubmit={handleUrlSubmit}>
                <div className="relative flex-1">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(event) => {
                      setUrlInput(event.target.value);
                      if (urlError) {
                        setUrlError(null);
                      }
                    }}
                    placeholder="https://inspiration-site.com"
                    className="w-full border-2 border-[#C5BEAF] bg-white px-6 py-3 text-sm text-[#0D1E3C] outline-none transition-all duration-200 focus:border-[#4A6FA5] focus:-translate-y-[2px]"
                    disabled={isAnalyzing}
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center border-2 border-[#2A4A8A] bg-[#2A4A8A] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.25em] text-white transition-all duration-200 hover:-translate-y-[2px] hover:bg-[#1F3A72] disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={!urlInput.trim() || isAnalyzing}
                >
                  Add URL
                </button>
              </form>
              {urlError ? (
                <p className="text-xs text-red-600">{urlError}</p>
              ) : (
                <p className="text-xs text-muted">
                  Any live site or reference link works—we’ll capture fonts, colors, and structural cues.
                </p>
              )}
            </div>

            {uploads.length ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b-2 border-[#E0DCD5] pb-3">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted">
                    Uploaded Inspirations
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-[#4A6FA5]" />
                    <span className="text-xs font-medium text-muted">{uploads.length}</span>
                  </div>
                </div>
                <ThumbnailGrid items={thumbnailItems} onRemove={isAnalyzing ? undefined : handleRemove} />
              </div>
            ) : null}
          </div>
        </section>

        <div className="flex flex-col gap-4 sm:flex-row">
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={!uploads.length || isAnalyzing}
            className="group relative inline-flex items-center justify-center overflow-hidden bg-[#2A4A8A] px-12 py-4 text-xs font-bold uppercase tracking-[0.3em] text-white transition-all duration-200 hover:-translate-y-[3px] hover:bg-[#1F3A72] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span className="relative z-10">{isAnalyzing ? "Analyzing…" : "Analyze Aesthetic"}</span>
            {/* Geometric accent */}
            <div className="absolute right-4 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-white opacity-60" />
          </button>
          {analysis ? (
            <button
              type="button"
              onClick={handleResetAnalysis}
              className="inline-flex items-center justify-center border-2 border-[#2A4A8A] bg-transparent px-8 py-4 text-xs font-bold uppercase tracking-[0.3em] text-[#2A4A8A] transition-all duration-200 hover:-translate-y-[3px] hover:bg-[#2A4A8A] hover:text-white"
            >
              Reset Summary
            </button>
          ) : null}
        </div>
        {error ? (
          <p role="status" className="text-sm text-[rgba(150,40,40,0.85)]">
            {error}
          </p>
        ) : null}

        {analysis ? (
          <div className="space-y-16">
            <section className="space-y-6">
              <div className="flex items-center justify-between border-b-2 border-[#E0DCD5] pb-3">
                <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted">
                  Inspiration Analysis
                </h2>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[#1A4D2E]" />
                  <span className="text-xs font-medium text-muted">{analysis.inspirations.length}</span>
                </div>
              </div>
              <InspirationInsights items={analysis.inspirations} />
            </section>

            <section className="space-y-6">
              <div className="flex items-center justify-between border-b-2 border-[#E0DCD5] pb-3">
                <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted">
                  Style Clusters
                </h2>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[#2A4A8A]" />
                  <span className="text-xs font-medium text-muted">{analysis.clusters.length}</span>
                </div>
              </div>
              <StyleClusterList clusters={analysis.clusters} />
            </section>

            <section className="space-y-6">
              <div className="flex items-center justify-between border-b-2 border-[#E0DCD5] pb-3">
                <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted">
                  Brand Guideline
                </h2>
                <span className="text-[10px] uppercase tracking-[0.25em] text-muted-light">GPT-4o</span>
              </div>
              <GuidelinePanel guideline={analysis.guideline} />
            </section>

            {analysis.directions && analysis.directions.length > 0 ? (
              <section className="space-y-6">
                <DesignDirections
                  directions={analysis.directions}
                  projectProfile={analysis.projectProfile}
                />
              </section>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="lg:w-1/3">
        {analysis ? (
          <SummaryCard
            headline={summaryHeadline}
            description={summaryDescription}
            palette={summaryPalette}
            fontDirection={summaryFontDirection}
            mood={summaryMood}
            keywords={summaryKeywords}
          />
        ) : (
          <aside className="surface-card relative h-fit overflow-hidden p-10 lg:sticky lg:top-12">
            <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#2A4A8A]" />
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted">
                  How it Works
                </p>
              </div>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <span className="text-4xl font-bold text-[#2A4A8A]">1</span>
                  <div>
                    <h3 className="text-base font-bold text-[#0D1E3C]">Upload Inspiration</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">
                      Drop images, screenshots, or paste URLs of designs that resonate with your
                      brand vision.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 border-t-2 border-[#E0DCD5] pt-6">
                  <span className="text-4xl font-bold text-[#2A4A8A]">2</span>
                  <div>
                    <h3 className="text-base font-bold text-[#0D1E3C]">Analyze Aesthetic</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">
                      Our engine extracts colors, typography, mood, and visual patterns from your
                      references.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 border-t-2 border-[#E0DCD5] pt-6">
                  <span className="text-4xl font-bold text-[#2A4A8A]">3</span>
                  <div>
                    <h3 className="text-base font-bold text-[#0D1E3C]">Get Guidelines</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">
                      Receive a comprehensive brand guideline with palette, typography, voice, and
                      style direction.
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t-2 border-[#E0DCD5] pt-8">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.28em] text-muted">
                  Pro Tips
                </h4>
                <ul className="mt-4 space-y-3 text-sm text-muted">
                  <li className="flex gap-2">
                    <span className="text-[#2A4A8A]">•</span>
                    <span>Upload 3-10 images for best results</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#2A4A8A]">•</span>
                    <span>Mix product shots, websites, and mood imagery</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#2A4A8A]">•</span>
                    <span>Include examples you want to emulate</span>
                  </li>
                </ul>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

