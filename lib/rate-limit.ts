// lib/rate-limit.ts
// Minimal in-memory IP rate limiter for public hackathon demo protection
// Avoids mandatory user accounts while protecting public API routes against automated flooding.

interface RateLimitEntry {
  count: number
  resetTime: number
}

const store = new Map<string, RateLimitEntry>()

export interface RateLimitOptions {
  limit: number // Max requests allowed per window
  windowMs: number // Window duration in milliseconds
}

export function checkRateLimit(
  key: string,
  options: RateLimitOptions = { limit: 20, windowMs: 60 * 1000 }
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const entry = store.get(key)

  // Periodic cleanup if map grows large to prevent memory leak
  if (store.size > 2000) {
    for (const [k, v] of store.entries()) {
      if (v.resetTime < now) {
        store.delete(k)
      }
    }
  }

  if (!entry || entry.resetTime < now) {
    store.set(key, { count: 1, resetTime: now + options.windowMs })
    return { allowed: true, remaining: options.limit - 1, resetTime: now + options.windowMs }
  }

  if (entry.count >= options.limit) {
    return { allowed: false, remaining: 0, resetTime: entry.resetTime }
  }

  entry.count++
  return { allowed: true, remaining: options.limit - entry.count, resetTime: entry.resetTime }
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }
  return request.headers.get("x-real-ip") || "anonymous-client"
}
