export type InspirationKind = "image" | "url";

export type UploadedInspiration = {
  clientId: string;
  kind: InspirationKind;
  originalName?: string;
  sourceUrl?: string;
  previewUrl?: string;
};

export type SupabaseInspirationRecord = {
  id: string;
  kind: InspirationKind;
  original_name: string | null;
  source_url: string | null;
  storage_path: string;
  mime_type: string | null;
  width: number | null;
  height: number | null;
  created_at: string;
};

export type SupabaseInspirationFeatureRecord = {
  inspiration_id: string;
  embedding_model: string | null;
  embedding: number[] | null;
  descriptors: Record<string, unknown> | null;
  created_at: string;
};

export type LocalInspirationRecord = SupabaseInspirationRecord & {
  binary?: Uint8Array;
  preview_url?: string | null;
};

export type ColorSwatch = {
  hex: string;
  name?: string;
  usage?: "primary" | "secondary" | "accent" | "supporting" | "neutral";
};

export type FontCategory =
  | "sans-serif"
  | "serif"
  | "slab-serif"
  | "display"
  | "mono"
  | "handwritten"
  | "other";

export type FontCandidate = {
  family: string;
  category: FontCategory;
  source?: "google-fonts" | "adobe-fonts" | "system" | "self-hosted" | "unknown";
  usage?: string;
  fallbackStack?: string;
};

export type ImageEssence = {
  summary: string;
  moodKeywords: string[];
  textures: string[];
  lighting?: string[];
  composition?: string[];
};

export type EmbeddingDescriptor = {
  model: string;
  vector: number[];
  dimensionality: number;
};

export type InspirationAnalysis = {
  inspirationId: string;
  kind: InspirationKind;
  source: string;
  previewUrl?: string;
  dominantColors: ColorSwatch[];
  fontCandidates: FontCandidate[];
  descriptors: ImageEssence;
  tags: string[];
  embedding?: EmbeddingDescriptor;
};

export type ClusterSummary = {
  clusterId: string;
  label: string;
  members: string[];
  narrative: string;
  palette: ColorSwatch[];
  fontThemes: FontCandidate[];
  mood: string[];
  keywords: string[];
};

export type ToneGuideline = {
  voice: string;
  adjectives: string[];
  messagingPillars: string[];
};

export type ImageryGuideline = {
  direction: string;
  treatments: string[];
  lighting: string[];
  composition: string[];
  textureNotes: string[];
};

export type BrandGuideline = {
  palette: {
    primary: ColorSwatch[];
    secondary: ColorSwatch[];
    neutrals: ColorSwatch[];
    accents: ColorSwatch[];
  };
  typography: {
    primary: FontCandidate;
    secondary?: FontCandidate;
    accent?: FontCandidate;
    code?: FontCandidate;
  };
  imagery: ImageryGuideline;
  tone: ToneGuideline;
  keywords: string[];
  summary: string;
};

export type BrandGuidelineSummary = {
  palette: string[];
  fontDirection: string;
  mood: string[];
  keywords: string[];
  narrative: string;
};

export type AnalysisJobStatus = "pending" | "processing" | "synthesized" | "failed";

export type AnalysisJobRecord = {
  id: string;
  status: AnalysisJobStatus;
  created_at: string;
  completed_at: string | null;
  error: string | null;
};

export type AnalysisResult = {
  inspirations: InspirationAnalysis[];
  clusters: ClusterSummary[];
  guideline: BrandGuideline;
  synthesis: BrandGuidelineSummary;
};

export type AnalyzeRequestPayload = {
  inspirationIds: string[];
  jobId?: string;
  options?: {
    clusterCount?: number;
    regenerate?: boolean;
  };
};

export type UploadAssetSummary = {
  id: string;
  storagePath: string;
  bucket: string;
  mimeType: string;
  width?: number;
  height?: number;
};

export type UploadBatchResponse = {
  uploadIds: string[];
  assets: UploadAssetSummary[];
};


