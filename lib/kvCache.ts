function kvAvailable() {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

async function getKV() {
  const { kv } = await import("@vercel/kv");
  return kv;
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  if (!kvAvailable()) return null;
  try {
    return await (await getKV()).get<T>(key);
  } catch { return null; }
}

export async function cacheSet(key: string, value: unknown, ttl = 600): Promise<void> {
  if (!kvAvailable()) return;
  try {
    await (await getKV()).set(key, value, { ex: ttl });
  } catch {}
}

export const prefetchKey = (mode: string, region: string) =>
  `cache:prefetch:${mode}:${region}`;
