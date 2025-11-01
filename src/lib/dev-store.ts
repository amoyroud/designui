import type { LocalInspirationRecord } from "@/lib/types";
const GLOBAL_KEY = "__reverse_moodboard_dev_store";

type DevStore = Map<string, LocalInspirationRecord>;

function getGlobalStore(): DevStore {
  const globalObject = globalThis as typeof globalThis & {
    [GLOBAL_KEY]?: DevStore;
  };

  if (!globalObject[GLOBAL_KEY]) {
    globalObject[GLOBAL_KEY] = new Map<string, LocalInspirationRecord>();
  }

  return globalObject[GLOBAL_KEY]!;
}

export function saveDevInspirationRecord(record: LocalInspirationRecord) {
  const store = getGlobalStore();
  store.set(record.id, record);
}

export function getDevInspirationRecord(id: string): LocalInspirationRecord | null {
  const store = getGlobalStore();
  return store.get(id) ?? null;
}

export function getDevInspirationRecords(ids: string[]): LocalInspirationRecord[] {
  const store = getGlobalStore();
  return ids
    .map((id) => store.get(id))
    .filter((record): record is LocalInspirationRecord => Boolean(record));
}


