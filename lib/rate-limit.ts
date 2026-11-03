// lib/rate-limit.ts
// Minimal in-memory IP rate limiter for public hackathon demo protection
// Avoids mandatory user accounts while protecting public API routes against automated flooding.
//
// ⚠️ ARCHITECTURAL LIMITATION & HONEST DISCLOSURE:
// This implementation uses a process-local in-memory JavaScript Map.
// In serverless hosting environments (such as Vercel Lambda / Edge functions), each execution
// container maintains its own isolated memory space. Rate limit counters are NOT synchronized
// across multiple concurrent serverless instances or geographically distributed edge regions.
//
// ADEQUACY FOR DEMO:
// For the BolSaakshi public hackathon demonstration, this in-memory implementation provides
// essential lightweight burst protection against single-client aggressive loops or script hammering
// directed at warm container instances, without requiring external database provisioning.
//
// PRODUCTION RECOMMENDATION:
// For distributed, globally enforced rate limiting at enterprise or production scale, integrate
// a centralized, shared key-value store such as Upstash Redis (@upstash/ratelimit) or Vercel KV,
// which maintains shared sliding-window state across all serverless regions and instances.

interface RateLimitEntry {
  count: number
  resetTime: number
}

const store = new Map<string, RateLimitEntry>()

export interface RateLimitOptions {
  limit: number // Max requests allowed per window on this instance
  windowMs: number // Window duration in milliseconds
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
  isInstanceLocal: true
}

export function checkRateLimit(
  key: string,
  options: RateLimitOptions = { limit: 20, windowMs: 60 * 1000 }
): RateLimitResult {
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
    return {
      allowed: true,
      remaining: options.limit - 1,
      resetTime: now + options.windowMs,
      isInstanceLocal: true,
    }
  }

  if (entry.count >= options.limit) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
      isInstanceLocal: true,
    }
  }

  entry.count++
  return {
    allowed: true,
    remaining: options.limit - entry.count,
    resetTime: entry.resetTime,
    isInstanceLocal: true,
  }
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }
  return request.headers.get("x-real-ip") || "anonymous-client"
}
