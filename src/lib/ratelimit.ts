/** Простой in-memory rate limiter (на инстанс). Для multi-instance — вынести в Redis. */
const buckets = new Map<string, number[]>();

export function rateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const arr = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  arr.push(now);
  buckets.set(key, arr);
  // защита от утечки памяти: чистим самые старые ключи
  if (buckets.size > 5000) {
    const oldest = [...buckets.keys()].slice(0, 1000);
    for (const k of oldest) buckets.delete(k);
  }
  return arr.length > limit;
}

export function clientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "local"
  );
}
