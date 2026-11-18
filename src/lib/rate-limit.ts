type Bucket = { hits: number[]; };

const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, limit: number, windowMs: number, now = Date.now()) {
  const bucket = buckets.get(key) ?? { hits: [] };
  bucket.hits = bucket.hits.filter((stamp) => now - stamp < windowMs);
  if (bucket.hits.length >= limit) {
    buckets.set(key, bucket);
    const retryAt = bucket.hits[0] + windowMs;
    return { ok: false as const, retryAfterMs: Math.max(0, retryAt - now) };
  }
  bucket.hits.push(now);
  buckets.set(key, bucket);
  return { ok: true as const, remaining: limit - bucket.hits.length };
}

export function resetRateLimits() {
  buckets.clear();
}
