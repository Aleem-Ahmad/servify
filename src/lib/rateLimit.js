/**
 * rateLimit.js
 * -----------
 * Tiered rate-limiting utility for Servify.
 *
 * Strategy:
 *  - If UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN are set  →  Upstash Redis (production)
 *  - Otherwise                                                       →  Sliding-window in-memory (development)
 *
 * Usage inside an API route:
 *   import { rateLimit } from '@/lib/rateLimit';
 *   const result = await rateLimit(request, { limit: 20, window: 60 }); // 20 req / 60 s
 *   if (!result.allowed) return result.response;
 */

import { NextResponse } from 'next/server';

// ─── In-Memory fallback (development / Vercel Serverless with single instance) ──
const _store = new Map(); // { key → { count, windowStart } }

function inMemoryRateLimit(key, limit, windowMs) {
  const now = Date.now();
  let entry = _store.get(key);

  if (!entry || now - entry.windowStart >= windowMs) {
    entry = { count: 0, windowStart: now };
  }

  entry.count++;
  _store.set(key, entry);

  // Prune keys older than 5× the window to prevent unbounded growth
  if (_store.size > 5000) {
    const cutoff = now - windowMs * 5;
    for (const [k, v] of _store) {
      if (v.windowStart < cutoff) _store.delete(k);
    }
  }

  const remaining = Math.max(0, limit - entry.count);
  const reset = Math.ceil((entry.windowStart + windowMs) / 1000);

  return {
    allowed: entry.count <= limit,
    remaining,
    reset,
    limit,
  };
}

// ─── Upstash Redis-backed rate limit ─────────────────────────────────────────
let _upstashRateLimit = null;

async function getUpstashRateLimiter(limit, window) {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }

  try {
    // Lazy import — only resolved if env vars are present
    const { Ratelimit } = await import('@upstash/ratelimit');
    const { Redis } = await import('@upstash/redis');

    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    return new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, `${window} s`),
      analytics: false,
      prefix: 'servify_rl',
    });
  } catch {
    return null;
  }
}

// ─── Public helper ────────────────────────────────────────────────────────────
/**
 * @param {Request} request
 * @param {{ limit?: number, window?: number, keyPrefix?: string }} options
 *   limit  – max requests (default 60)
 *   window – window in seconds (default 60)
 *   keyPrefix – prepended to the key (e.g. 'auth', 'booking')
 * @returns {{ allowed: boolean, remaining: number, reset: number, response?: NextResponse }}
 */
export async function rateLimit(request, options = {}) {
  const { limit = 60, window = 60, keyPrefix = 'global' } = options;

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  const userId = request.headers.get('x-user-id') || '';
  const key = `${keyPrefix}:${userId || ip}`;

  let result;

  // Try Upstash first
  try {
    const limiter = await getUpstashRateLimiter(limit, window);
    if (limiter) {
      const upstashResult = await limiter.limit(key);
      result = {
        allowed: upstashResult.success,
        remaining: upstashResult.remaining,
        reset: Math.ceil(upstashResult.reset / 1000),
        limit: upstashResult.limit,
      };
    }
  } catch {
    // Fall through to in-memory
  }

  // Fallback to in-memory
  if (!result) {
    result = inMemoryRateLimit(key, limit, window * 1000);
  }

  if (!result.allowed) {
    const response = NextResponse.json(
      { error: 'Too many requests. Please slow down.', retryAfter: result.reset },
      {
        status: 429,
        headers: {
          'Retry-After': String(result.reset - Math.floor(Date.now() / 1000)),
          'X-RateLimit-Limit': String(result.limit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(result.reset),
        },
      }
    );
    return { ...result, response };
  }

  return { ...result, response: null };
}

// ─── Convenience presets ──────────────────────────────────────────────────────
export const authRateLimit = (req) => rateLimit(req, { limit: 10, window: 60, keyPrefix: 'auth' });
export const bookingRateLimit = (req) => rateLimit(req, { limit: 30, window: 60, keyPrefix: 'booking' });
export const apiRateLimit = (req) => rateLimit(req, { limit: 100, window: 60, keyPrefix: 'api' });
