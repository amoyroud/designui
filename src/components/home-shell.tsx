"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Dropzone } from "@/components/dropzone";
import { SummaryCard } from "@/components/summary-card";
import { ThumbnailGrid } from "@/components/thumbnail-grid";
import { StyleClusterList } from "@/components/style-cluster-list";
import { GuidelinePanel } from "@/components/guideline-panel";
import { InspirationInsights } from "@/components/inspiration-insights";
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
        body: JSON.stringify({ inspirationIds: uploadIds }),
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
      setError(
        err instanceof Error
          ? err.message
          : "We couldn’t complete the analysis. Please try again.",
      );
    } finally {
      setIsAnalyzing(false);
    }
  }, [uploads]);

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
    <div className="mx-auto flex min-h-screen w-full max-w-[1200px] flex-col gap-16 px-6 pb-24 pt-16 lg:flex-row lg:gap-12 lg:px-12 lg:pt-24">
      <div className="flex w-full flex-col gap-12 lg:w-2/3">
        <header className="space-y-6">
          <p className="text-xs uppercase tracking-[0.32em] text-muted">Reverse Moodboard Engine</p>
          <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-[rgba(47,47,47,0.95)]">
            Drop your inspiration. Distill the aesthetic DNA.
          </h1>
          <p className="max-w-xl text-base text-muted">
            Upload brand fragments, product shots, or mood imagery. We will synthesize the shared
            palette, typography energy, textures, and emotional tone into a concise creative
            direction.
          </p>
        </header>

        <Dropzone onFilesSelected={handleFilesSelected} disabled={isAnalyzing} isAnalyzing={isAnalyzing} />

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium uppercase tracking-[0.14em] text-muted">
              Inspiration grid
            </h2>
            <span className="text-xs text-muted">{uploads.length} uploads</span>
          </div>
          <ThumbnailGrid items={thumbnailItems} onRemove={isAnalyzing ? undefined : handleRemove} />
        </section>

        <section className="space-y-4 rounded-[24px] border border-[rgba(47,47,47,0.08)] bg-white/40 p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.6)]">
          <h2 className="text-sm font-medium uppercase tracking-[0.14em] text-muted">Add inspiration link</h2>
          <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleUrlSubmit}>
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
                className="w-full rounded-full border border-[rgba(47,47,47,0.08)] bg-white/70 px-5 py-3 text-sm text-[rgba(47,47,47,0.85)] outline-none transition focus:border-[rgba(138,126,106,0.6)] focus:ring-2 focus:ring-[rgba(138,126,106,0.2)]"
                disabled={isAnalyzing}
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-[rgba(138,126,106,0.85)] px-7 py-3 text-sm font-medium uppercase tracking-[0.18em] text-white transition duration-150 ease-out hover:bg-[rgba(138,126,106,1)] disabled:cursor-not-allowed disabled:bg-[rgba(138,126,106,0.35)]"
              disabled={!urlInput.trim() || isAnalyzing}
            >
              Add URL
            </button>
          </form>
          {urlError ? (
            <p className="text-xs text-[rgba(150,40,40,0.85)]">{urlError}</p>
          ) : (
            <p className="text-xs text-muted">Paste any live site or inspiration link to capture fonts and colors.</p>
          )}
        </section>

        <div className="flex flex-col gap-4 sm:flex-row">
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={!uploads.length || isAnalyzing}
            className="inline-flex items-center justify-center rounded-full bg-[rgba(138,126,106,0.85)] px-8 py-3 text-sm font-medium uppercase tracking-[0.18em] text-white transition duration-150 ease-out hover:bg-[rgba(138,126,106,1)] disabled:cursor-not-allowed disabled:bg-[rgba(138,126,106,0.35)]"
          >
            {isAnalyzing ? "Analyzing…" : "Analyze Aesthetic"}
          </button>
          {analysis ? (
            <button
              type="button"
              onClick={handleResetAnalysis}
              className="inline-flex items-center justify-center rounded-full border border-[rgba(138,126,106,0.4)] px-6 py-3 text-sm font-medium uppercase tracking-[0.18em] text-muted transition duration-150 ease-out hover:border-[rgba(138,126,106,0.7)] hover:text-[rgba(47,47,47,0.8)]"
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
          <div className="space-y-10">
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium uppercase tracking-[0.14em] text-muted">Inspiration analysis</h2>
                <span className="text-xs text-muted">{analysis.inspirations.length} distilled</span>
              </div>
              <InspirationInsights items={analysis.inspirations} />
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium uppercase tracking-[0.14em] text-muted">Style clusters</h2>
                <span className="text-xs text-muted">{analysis.clusters.length} clusters</span>
              </div>
              <StyleClusterList clusters={analysis.clusters} />
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium uppercase tracking-[0.14em] text-muted">Brand guideline</h2>
                <span className="text-xs text-muted">Generated via GPT-4o</span>
              </div>
              <GuidelinePanel guideline={analysis.guideline} />
            </section>
          </div>
        ) : null}
      </div>

      <div className="lg:w-1/3">
        <SummaryCard
          headline={summaryHeadline}
          description={summaryDescription}
          palette={summaryPalette}
          fontDirection={summaryFontDirection}
          mood={summaryMood}
          keywords={summaryKeywords}
          isEmpty={!analysis}
        />
      </div>
    </div>
  );
}

