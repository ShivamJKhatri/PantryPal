import type { VercelRequest, VercelResponse } from '@vercel/node'

export type RateLimitConfig = {
  /** Identifier for this limiter (e.g. parse-url) */
  name: string
  /** Max requests per window */
  limit: number
  /** Window length in milliseconds */
  windowMs: number
}

type LimitResult = {
  allowed: boolean
  remaining: number
  resetAt: number
}

const memoryBuckets = new Map<string, { count: number; resetAt: number }>()

function getClientIp(request: VercelRequest): string {
  const forwarded = request.headers['x-forwarded-for']
  if (typeof forwarded === 'string') return forwarded.split(',')[0]?.trim() || 'unknown'
  if (Array.isArray(forwarded)) return forwarded[0] ?? 'unknown'
  return request.socket?.remoteAddress ?? 'unknown'
}

function checkMemoryLimit(key: string, limit: number, windowMs: number): LimitResult {
  const now = Date.now()
  const entry = memoryBuckets.get(key)

  if (!entry || now >= entry.resetAt) {
    const resetAt = now + windowMs
    memoryBuckets.set(key, { count: 1, resetAt })
    return { allowed: true, remaining: limit - 1, resetAt }
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt }
  }

  entry.count += 1
  return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt }
}

async function checkUpstashLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<LimitResult | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null

  const windowSec = Math.max(1, Math.ceil(windowMs / 1000))
  const res = await fetch(`${url}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify([
      ['INCR', key],
      ['TTL', key],
    ]),
  })

  if (!res.ok) return null

  const data = (await res.json()) as Array<{ result?: number }>
  const current = typeof data[0]?.result === 'number' ? data[0].result : 1
  let ttlSec = typeof data[1]?.result === 'number' ? data[1].result : -1

  if (ttlSec < 0) {
    await fetch(`${url}/pipeline`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify([['EXPIRE', key, windowSec]]),
    })
    ttlSec = windowSec
  }

  const resetAt = Date.now() + ttlSec * 1000
  if (current > limit) {
    return { allowed: false, remaining: 0, resetAt }
  }
  return { allowed: true, remaining: Math.max(0, limit - current), resetAt }
}

async function checkLimit(key: string, config: RateLimitConfig): Promise<LimitResult> {
  try {
    const upstash = await checkUpstashLimit(key, config.limit, config.windowMs)
    if (upstash) return upstash
  } catch {
    // fall through to memory limiter
  }
  return checkMemoryLimit(key, config.limit, config.windowMs)
}

function setRateLimitHeaders(response: VercelResponse, config: RateLimitConfig, result: LimitResult) {
  response.setHeader('X-RateLimit-Limit', String(config.limit))
  response.setHeader('X-RateLimit-Remaining', String(result.remaining))
  response.setHeader('X-RateLimit-Reset', String(Math.ceil(result.resetAt / 1000)))
}

/** Returns false if the request was blocked (response already sent). */
export async function enforceRateLimit(
  request: VercelRequest,
  response: VercelResponse,
  config: RateLimitConfig,
): Promise<boolean> {
  const ip = getClientIp(request)
  const key = `ratelimit:${config.name}:${ip}`
  const result = await checkLimit(key, config)

  setRateLimitHeaders(response, config, result)

  if (!result.allowed) {
    const retryAfter = Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000))
    response.setHeader('Retry-After', String(retryAfter))
    response.status(429).json({
      error: 'Too many requests. Please wait a moment and try again.',
      retryAfter,
    })
    return false
  }

  return true
}

/** Preset limits for expensive vs cheap endpoints */
export const RATE_LIMITS = {
  parseUrl: { name: 'parse-url', limit: 10, windowMs: 60_000 },
  parseScreenshot: { name: 'parse-screenshot', limit: 5, windowMs: 60_000 },
  matchItem: { name: 'match-item', limit: 60, windowMs: 60_000 },
  recipes: { name: 'recipes', limit: 120, windowMs: 60_000 },
  storeOptions: { name: 'store-options', limit: 120, windowMs: 60_000 },
} as const satisfies Record<string, RateLimitConfig>
