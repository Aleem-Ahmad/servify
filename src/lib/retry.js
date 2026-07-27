/**
 * retry.js
 * --------
 * Exponential back-off retry utility for Servify.
 *
 * Usage:
 *   import { withRetry } from '@/lib/retry';
 *
 *   const data = await withRetry(
 *     () => prisma.booking.findUnique({ where: { id } }),
 *     { retries: 3, baseDelay: 300, label: 'fetch-booking' }
 *   );
 */

/**
 * @param {() => Promise<T>} fn           The async function to retry
 * @param {{
 *   retries?:   number,   // max attempts (default 3)
 *   baseDelay?: number,   // initial delay ms (default 200)
 *   maxDelay?:  number,   // cap on delay ms (default 10_000)
 *   factor?:    number,   // exponential factor (default 2)
 *   jitter?:    boolean,  // add random jitter (default true)
 *   shouldRetry?: (err: Error, attempt: number) => boolean,
 *   label?:     string,   // for logging
 * }} options
 * @returns {Promise<T>}
 */
export async function withRetry(fn, options = {}) {
  const {
    retries = 3,
    baseDelay = 200,
    maxDelay = 10_000,
    factor = 2,
    jitter = true,
    shouldRetry = defaultShouldRetry,
    label = 'operation',
  } = options;

  let lastError;

  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;

      const isLastAttempt = attempt > retries;
      if (isLastAttempt || !shouldRetry(err, attempt)) {
        throw err;
      }

      const delay = calcDelay(attempt, baseDelay, maxDelay, factor, jitter);
      console.warn(`[Retry] "${label}" attempt ${attempt} failed. Retrying in ${delay}ms…`, err?.message);
      await sleep(delay);
    }
  }

  throw lastError;
}

// ─── Default retry predicate ──────────────────────────────────────────────────
function defaultShouldRetry(err, _attempt) {
  // Retry on network errors, 5xx, or specific Prisma transient errors
  if (!err) return false;

  const msg = (err?.message || '').toLowerCase();
  const code = err?.status || err?.code;

  const transientPrisma = [
    'p1001', // Cannot reach DB
    'p1002', // DB timeout
    'p2024', // Connection pool timeout
  ].includes((err?.code || '').toLowerCase());

  const is5xx = typeof code === 'number' && code >= 500 && code < 600;
  const isNetworkError = msg.includes('fetch') || msg.includes('econnreset') || msg.includes('etimedout');

  // Do NOT retry auth/validation errors
  const isClientError = typeof code === 'number' && code >= 400 && code < 500;
  if (isClientError) return false;

  return transientPrisma || is5xx || isNetworkError;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function calcDelay(attempt, base, max, factor, jitter) {
  let delay = base * Math.pow(factor, attempt - 1);
  if (jitter) delay += Math.random() * delay * 0.3;
  return Math.min(delay, max);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Wraps an async function so that it retries automatically.
 * @example
 *   const safeFetch = retryable(fetch, { retries: 2 });
 *   const res = await safeFetch('/api/bookings');
 */
export function retryable(fn, options = {}) {
  return (...args) => withRetry(() => fn(...args), options);
}
