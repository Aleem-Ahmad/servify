/**
 * eventBus.js
 * -----------
 * Servify's internal event bus (message bus) for decoupled server-side communication.
 *
 * Architecture:
 *  - Server-side pub/sub using Supabase Realtime broadcast channels
 *  - In-process fallback using a lightweight EventEmitter for development
 *  - Events are fire-and-forget (no delivery guarantees beyond Supabase)
 *
 * Event Catalogue:
 *   booking.created       – a new booking was placed
 *   booking.accepted      – a provider accepted the booking
 *   booking.cancelled     – a customer/provider cancelled
 *   booking.completed     – work is marked done
 *   booking.rejected      – provider rejected
 *   bargain.offer_made    – new bargain offer
 *   bargain.offer_accepted – offer accepted
 *   feedback.submitted    – customer left feedback
 *   notification.send     – generic notification trigger
 *
 * Usage (publish):
 *   import { eventBus } from '@/lib/eventBus';
 *   await eventBus.publish('booking.accepted', { bookingId, providerId, customerId });
 *
 * Usage (subscribe — server-side only, e.g. in a Route Handler):
 *   const unsub = eventBus.subscribe('booking.accepted', async (payload) => {
 *     await sendEmail(payload.customerId, 'Your booking was accepted!');
 *   });
 *   // call unsub() to remove listener
 */

import { createClient } from '@supabase/supabase-js';

// ─── In-process EventEmitter fallback ─────────────────────────────────────────
class InProcessBus {
  constructor() {
    this._listeners = new Map(); // event → Set<handler>
  }

  subscribe(event, handler) {
    if (!this._listeners.has(event)) this._listeners.set(event, new Set());
    this._listeners.get(event).add(handler);
    return () => this._listeners.get(event)?.delete(handler);
  }

  async publish(event, payload) {
    const handlers = this._listeners.get(event);
    if (!handlers) return;
    for (const handler of handlers) {
      try {
        await handler({ event, payload, timestamp: new Date().toISOString() });
      } catch (err) {
        console.error(`[EventBus] Handler error for "${event}":`, err);
      }
    }
  }
}

// ─── Supabase Realtime bus ────────────────────────────────────────────────────
class SupabaseRealtimeBus {
  constructor(supabaseUrl, serviceKey) {
    this._supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
      realtime: { params: { eventsPerSecond: 40 } },
    });
    this._channel = this._supabase.channel('servify:events', {
      config: { broadcast: { self: true } },
    });
    this._handlers = new Map();
    this._connected = false;
  }

  _ensureConnected() {
    if (this._connected) return;
    this._connected = true;

    this._channel.on('broadcast', { event: '*' }, ({ event, payload }) => {
      const handlers = this._handlers.get(event) || new Set();
      for (const handler of handlers) {
        handler({ event, payload, timestamp: payload?._ts || new Date().toISOString() }).catch((err) => {
          console.error(`[EventBus] Handler error for "${event}":`, err);
        });
      }
    });

    this._channel.subscribe((status) => {
      if (status !== 'SUBSCRIBED') {
        console.warn('[EventBus] Realtime subscription status:', status);
      }
    });
  }

  subscribe(event, handler) {
    this._ensureConnected();
    if (!this._handlers.has(event)) this._handlers.set(event, new Set());
    this._handlers.get(event).add(handler);
    return () => this._handlers.get(event)?.delete(handler);
  }

  async publish(event, payload) {
    this._ensureConnected();
    const result = await this._channel.send({
      type: 'broadcast',
      event,
      payload: { ...payload, _ts: new Date().toISOString() },
    });
    if (result !== 'ok') {
      console.warn(`[EventBus] Failed to publish "${event}":`, result);
    }
  }
}

// ─── Factory: pick the right bus ─────────────────────────────────────────────
function createBus() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||    // preferred (server-only secret)
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;  // anon key fallback

  if (url && serviceKey) {
    try {
      return new SupabaseRealtimeBus(url, serviceKey);
    } catch {
      // fall through
    }
  }

  console.info('[EventBus] Using in-process bus (set SUPABASE_SERVICE_ROLE_KEY for Realtime)');
  return new InProcessBus();
}

// Singleton — module-level, so the same instance is reused in dev HMR
let _bus;
function getBus() {
  if (!_bus) _bus = createBus();
  return _bus;
}

// ─── Public interface ─────────────────────────────────────────────────────────
export const eventBus = {
  /**
   * Publish an event.
   * @param {string} event  Dot-notation name, e.g. 'booking.accepted'
   * @param {object} payload  Any serialisable data
   */
  publish: (event, payload) => getBus().publish(event, payload),

  /**
   * Subscribe to an event.
   * @param {string} event
   * @param {(msg: { event, payload, timestamp }) => Promise<void>} handler
   * @returns {() => void} unsubscribe function
   */
  subscribe: (event, handler) => getBus().subscribe(event, handler),
};

// ─── Event type constants ─────────────────────────────────────────────────────
export const EVENTS = {
  BOOKING_CREATED:        'booking.created',
  BOOKING_ACCEPTED:       'booking.accepted',
  BOOKING_CANCELLED:      'booking.cancelled',
  BOOKING_COMPLETED:      'booking.completed',
  BOOKING_REJECTED:       'booking.rejected',
  BOOKING_IN_PROGRESS:    'booking.in_progress',
  BARGAIN_OFFER_MADE:     'bargain.offer_made',
  BARGAIN_OFFER_ACCEPTED: 'bargain.offer_accepted',
  FEEDBACK_SUBMITTED:     'feedback.submitted',
  NOTIFICATION_SEND:      'notification.send',
  PROVIDER_LOCATION_UPDATE: 'provider.location_update',
};
