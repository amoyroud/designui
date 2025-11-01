import { NextResponse } from "next/server";
import { ensureBucketExists, getSupabaseAdminClient, getSupabaseBucketName, isSupabaseEnabled } from "@/lib/supabase";
import { saveDevInspirationRecord } from "@/lib/dev-store";
import type { InspirationKind, UploadBatchResponse, UploadAssetSummary } from "@/types/aesthetic";

export const runtime = "nodejs";

type UploadManifestEntry = {
  clientId: string;
  kind: InspirationKind;
  name: string;
  url?: string;
};

const FALLBACK_BUCKET = "dev-local";

function randomId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `upload-${Date.now()}-${Math.round(Math.random() * 1_000_000)}`;
}

function extensionFromName(name: string) {
  const match = name.match(/\.([a-zA-Z0-9]{2,5})$/);
  if (match) {
    return `.${match[1].toLowerCase()}`;
  }
  return "";
}

function sanitizeFilename(name: string) {
  return name.replace(/[^a-z0-9-_]+/gi, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").toLowerCase();
}

export async function POST(request: Request) {
  const formData = await request.formData();

  const manifestRaw = formData.get("manifest");

  const manifestText =
    typeof manifestRaw === "string"
      ? manifestRaw
      : manifestRaw instanceof File
        ? await manifestRaw.text()
        : "";

  if (!manifestText) {
    return NextResponse.json({ message: "Missing upload manifest" }, { status: 400 });
  }

  let manifest: UploadManifestEntry[] = [];

  try {
    manifest = JSON.parse(manifestText) as UploadManifestEntry[];
  } catch {
    return NextResponse.json({ message: "Invalid upload manifest" }, { status: 400 });
  }

  const fileEntries = formData.getAll("files").filter((entry): entry is File => entry instanceof File);

  const supabaseClient = getSupabaseAdminClient();
  const bucketName = supabaseClient ? getSupabaseBucketName() : FALLBACK_BUCKET;

  if (supabaseClient) {
    try {
      await ensureBucketExists(supabaseClient, bucketName);
    } catch (error) {
      console.error("Failed to ensure Supabase bucket", error);
      return NextResponse.json({ message: "Storage initialization failed" }, { status: 500 });
    }
  } else if (isSupabaseEnabled()) {
    console.warn("Supabase configuration detected but admin client not initialized");
  }

  const uploadSummaries: UploadAssetSummary[] = [];
  const recordsForInsert: Array<Record<string, unknown>> = [];
  const uploadIds: string[] = [];

  let fileCursor = 0;

  for (const entry of manifest) {
    const id = randomId();
    const kind = entry.kind;
    const baseName = entry.name || "inspiration";
    const sanitized = sanitizeFilename(baseName) || "inspiration";

    let storagePath = `${kind}/${sanitized}-${id}`;
    let mimeType = "application/octet-stream";
    let width: number | undefined;
    let height: number | undefined;

    if (kind === "image") {
      const file = fileEntries[fileCursor++];
      if (!file) {
        return NextResponse.json({ message: "Upload manifest does not match file payload" }, { status: 400 });
      }

      const extension = extensionFromName(file.name || baseName) || extensionFromName(baseName);
      storagePath = `${kind}/${id}${extension || ""}`;
      mimeType = file.type || mimeType;

    if (supabaseClient) {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);
          const uploadResult = await supabaseClient.storage
            .from(bucketName)
            .upload(storagePath, uint8Array, {
              upsert: false,
              contentType: mimeType,
            });

          if (uploadResult.error) {
            console.error("Supabase storage upload failed", uploadResult.error);
            return NextResponse.json({ message: "Failed to store inspiration" }, { status: 500 });
          }
        } catch (error) {
          console.error("Unexpected error during storage upload", error);
          return NextResponse.json({ message: "Failed to store inspiration" }, { status: 500 });
        }

        recordsForInsert.push({
          id,
          kind,
          original_name: file.name ?? baseName,
          source_url: null,
          storage_path: storagePath,
          mime_type: mimeType,
          width: width ?? null,
          height: height ?? null,
        });
      } else {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);

          saveDevInspirationRecord({
            id,
            kind,
            original_name: file.name ?? baseName,
            source_url: null,
            storage_path: storagePath,
            mime_type: mimeType,
            width: width ?? null,
            height: height ?? null,
            created_at: new Date().toISOString(),
            binary: uint8Array,
            preview_url: null,
          });
        } catch (error) {
          console.error("Failed to buffer inspiration locally", error);
          return NextResponse.json({ message: "Failed to store inspiration" }, { status: 500 });
        }
      }
    } else {
      mimeType = "application/json";
      storagePath = `${kind}/${id}.json`;

      if (supabaseClient && entry.url) {
        const linkPayload = JSON.stringify({
          url: entry.url,
          addedAt: new Date().toISOString(),
        });
        const linkBuffer = new TextEncoder().encode(linkPayload);

        const uploadResult = await supabaseClient.storage.from(bucketName).upload(storagePath, linkBuffer, {
          upsert: true,
          contentType: mimeType,
        });

        if (uploadResult.error) {
          console.error("Supabase storage upload failed for URL", uploadResult.error);
          return NextResponse.json({ message: "Failed to store link inspiration" }, { status: 500 });
        }
      }

      if (supabaseClient) {
        recordsForInsert.push({
          id,
          kind,
          original_name: baseName,
          source_url: entry.url ?? null,
          storage_path: storagePath,
          mime_type: mimeType,
          width: null,
          height: null,
        });
      } else {
        saveDevInspirationRecord({
          id,
          kind,
          original_name: baseName,
          source_url: entry.url ?? null,
          storage_path: storagePath,
          mime_type: mimeType,
          width: null,
          height: null,
          created_at: new Date().toISOString(),
          binary: undefined,
          preview_url: entry.url ?? null,
        });
      }
    }

    uploadIds.push(id);
    uploadSummaries.push({
      id,
      storagePath,
      bucket: bucketName,
      mimeType,
      width,
      height,
    });
  }

  if (supabaseClient && recordsForInsert.length) {
    const insertResult = await supabaseClient.from("inspirations").insert(recordsForInsert);

    if (insertResult.error) {
      console.error("Failed to insert inspiration records", insertResult.error);
      return NextResponse.json({ message: "Failed to record inspiration metadata" }, { status: 500 });
    }
  }

  const payload: UploadBatchResponse = {
    uploadIds,
    assets: uploadSummaries,
  };

  return NextResponse.json(payload, { status: 200 });
}

