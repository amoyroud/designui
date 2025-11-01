import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type SupabaseConfig = {
  url: string;
  anonKey: string;
  serviceRoleKey?: string;
  bucket?: string;
};

let cachedAdminClient: SupabaseClient | null = null;

const DEFAULT_BUCKET = "inspirations";

function readConfig(): SupabaseConfig | null {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  return {
    url,
    anonKey,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE,
    bucket: process.env.SUPABASE_STORAGE_BUCKET ?? DEFAULT_BUCKET,
  };
}

export function isSupabaseEnabled() {
  const config = readConfig();
  return Boolean(config && config.serviceRoleKey);
}

export function getSupabaseBucketName() {
  const config = readConfig();
  return config?.bucket ?? DEFAULT_BUCKET;
}

export function getSupabaseAdminClient(): SupabaseClient | null {
  if (cachedAdminClient) {
    return cachedAdminClient;
  }

  const config = readConfig();

  if (!config?.serviceRoleKey) {
    return null;
  }

  cachedAdminClient = createClient(config.url, config.serviceRoleKey, {
    auth: {
      persistSession: false,
    },
  });

  return cachedAdminClient;
}

export async function ensureBucketExists(client: SupabaseClient, bucket: string) {
  const list = await client.storage.listBuckets();

  if (list.error) {
    throw list.error;
  }

  const exists = list.data?.some((b) => b.name === bucket);

  if (!exists) {
    const createResult = await client.storage.createBucket(bucket, {
      public: false,
    });

    if (createResult.error) {
      throw createResult.error;
    }
  }
}


