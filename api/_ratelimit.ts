/**
 * Lightweight in-memory rate limiter for Vercel serverless functions.
 *
 * Each serverless instance keeps its own map, which is sufficient to block
 * scripted brute-force attacks. For a fully distributed limit across all
 * instances, swap the store for Vercel KV / Upstash Redis.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number; // unix ms
}

const store = new Map<string, RateLimitEntry>();

// Prune stale entries every 500 requests to prevent unbounded memory growth
let pruneCounter = 0;
function maybePrune() {
  if (++pruneCounter < 500) return;
  pruneCounter = 0;
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt < now) store.delete(key);
  }
}

/**
 * Returns `true` when the caller is allowed through, `false` when they are
 * rate-limited.
 *
 * @param key        Unique identifier for the limit bucket (e.g. IP + action).
 * @param maxRequests Maximum number of requests allowed in the window.
 * @param windowMs   Rolling window in milliseconds.
 */
export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
  maybePrune();

  const now = Date.now();
  let entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    entry = { count: 0, resetAt: now + windowMs };
    store.set(key, entry);
  }

  entry.count += 1;
  const remaining = Math.max(0, maxRequests - entry.count);
  return { allowed: entry.count <= maxRequests, remaining, resetAt: entry.resetAt };
}

/**
 * Extract a stable client IP from Vercel request headers.
 */
export function getClientIp(headers: Record<string, string | string[] | undefined>): string {
  const forwarded = headers['x-forwarded-for'];
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
  if (Array.isArray(forwarded) && forwarded.length > 0) return forwarded[0].trim();
  return 'unknown';
}
