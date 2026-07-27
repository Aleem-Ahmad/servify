/**
 * circuitBreaker.js
 * -----------------
 * Lightweight circuit-breaker pattern for external service calls.
 *
 * States:
 *   CLOSED  – everything is fine, requests flow through
 *   OPEN    – too many failures, requests are rejected immediately (fast-fail)
 *   HALF_OPEN – one probe request is allowed to check if the service recovered
 *
 * Usage:
 *   import { CircuitBreaker } from '@/lib/circuitBreaker';
 *
 *   const emailBreaker = new CircuitBreaker('email-service', {
 *     failureThreshold: 5,
 *     successThreshold: 2,
 *     timeout: 30_000,
 *   });
 *
 *   const result = await emailBreaker.call(() => sendEmail(payload));
 */

const STATE = { CLOSED: 'CLOSED', OPEN: 'OPEN', HALF_OPEN: 'HALF_OPEN' };

// Global registry so the same breaker is reused across module imports
const _registry = new Map();

export class CircuitBreaker {
  /**
   * @param {string} name Unique name (e.g. 'email-service', 'cloudinary', 'supabase')
   * @param {{
   *   failureThreshold?: number,  // failures before OPEN (default 5)
   *   successThreshold?: number,  // successes in HALF_OPEN before CLOSED (default 2)
   *   timeout?: number,           // ms to wait before trying HALF_OPEN (default 30000)
   *   onStateChange?: (name, prev, next) => void
   * }} options
   */
  constructor(name, options = {}) {
    if (_registry.has(name)) return _registry.get(name);

    this.name = name;
    this.failureThreshold = options.failureThreshold ?? 5;
    this.successThreshold = options.successThreshold ?? 2;
    this.timeout = options.timeout ?? 30_000;
    this.onStateChange = options.onStateChange ?? null;

    this._state = STATE.CLOSED;
    this._failures = 0;
    this._successes = 0;
    this._nextAttempt = Date.now();

    _registry.set(name, this);
  }

  get state() { return this._state; }

  _transition(newState) {
    if (this._state === newState) return;
    const prev = this._state;
    this._state = newState;
    this._failures = 0;
    this._successes = 0;
    if (this.onStateChange) this.onStateChange(this.name, prev, newState);
    console.log(`[CircuitBreaker] "${this.name}": ${prev} → ${newState}`);
  }

  /**
   * Execute fn through the circuit breaker.
   * @param {() => Promise<any>} fn  The function to protect
   * @returns {Promise<any>}         Result of fn, or throws CircuitOpenError
   */
  async call(fn) {
    if (this._state === STATE.OPEN) {
      if (Date.now() < this._nextAttempt) {
        throw new CircuitOpenError(
          `Circuit "${this.name}" is OPEN. Retry after ${new Date(this._nextAttempt).toISOString()}`
        );
      }
      // Allow one probe
      this._transition(STATE.HALF_OPEN);
    }

    try {
      const result = await fn();
      this._onSuccess();
      return result;
    } catch (err) {
      this._onFailure();
      throw err;
    }
  }

  _onSuccess() {
    if (this._state === STATE.HALF_OPEN) {
      this._successes++;
      if (this._successes >= this.successThreshold) {
        this._transition(STATE.CLOSED);
      }
    } else {
      this._failures = 0;
    }
  }

  _onFailure() {
    this._failures++;
    if (this._state === STATE.HALF_OPEN || this._failures >= this.failureThreshold) {
      this._nextAttempt = Date.now() + this.timeout;
      this._transition(STATE.OPEN);
    }
  }

  /** Reset the breaker manually (e.g., after a deployment fix) */
  reset() { this._transition(STATE.CLOSED); }

  /** Serialize state for health-check endpoints */
  toJSON() {
    return {
      name: this.name,
      state: this._state,
      failures: this._failures,
      nextAttempt: this._state === STATE.OPEN ? this._nextAttempt : null,
    };
  }
}

export class CircuitOpenError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CircuitOpenError';
    this.status = 503;
  }
}

// ─── Pre-configured breakers for Servify's external services ─────────────────
export const breakers = {
  email:      new CircuitBreaker('email',      { failureThreshold: 3, timeout: 60_000 }),
  cloudinary: new CircuitBreaker('cloudinary', { failureThreshold: 5, timeout: 30_000 }),
  supabase:   new CircuitBreaker('supabase',   { failureThreshold: 5, timeout: 15_000 }),
  prisma:     new CircuitBreaker('prisma',     { failureThreshold: 5, timeout: 10_000 }),
  socket:     new CircuitBreaker('socket',     { failureThreshold: 10, timeout: 20_000 }),
};

/** Convenience: get all breaker statuses for the /api/health endpoint */
export function getAllBreakerStatus() {
  return Object.fromEntries(
    Object.entries(breakers).map(([k, b]) => [k, b.toJSON()])
  );
}
