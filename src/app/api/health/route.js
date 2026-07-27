/**
 * GET /api/health
 * ---------------
 * Public health-check endpoint for monitoring, load balancers, and uptime checks.
 *
 * Returns:
 *   200  – all critical services healthy
 *   503  – one or more services degraded
 *
 * Response body:
 * {
 *   "status": "healthy" | "degraded",
 *   "version": "...",
 *   "uptime": 123,           // seconds since process start
 *   "timestamp": "ISO",
 *   "services": {
 *     "database": { "status": "ok" | "error", "latencyMs": 12 },
 *     "supabase":  { "status": "ok" | "error", "latencyMs": 8 },
 *     "breakers": { "email": {...}, "cloudinary": {...} }
 *   }
 * }
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAllBreakerStatus } from '@/lib/circuitBreaker';

const START_TIME = Date.now();

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const services = {};
  let healthy = true;

  // ── Database (Prisma) ──────────────────────────────────────────────────────
  const dbStart = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    services.database = { status: 'ok', latencyMs: Date.now() - dbStart };
  } catch (err) {
    healthy = false;
    services.database = { status: 'error', error: err?.message || 'Unknown', latencyMs: Date.now() - dbStart };
  }

  // ── Supabase reachability ──────────────────────────────────────────────────
  const sbStart = Date.now();
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl) {
      const res = await fetch(`${supabaseUrl}/rest/v1/`, {
        headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '' },
        signal: AbortSignal.timeout(5000),
      });
      services.supabase = {
        status: res.ok || res.status === 401 ? 'ok' : 'error',
        latencyMs: Date.now() - sbStart,
      };
    } else {
      services.supabase = { status: 'not_configured' };
    }
  } catch (err) {
    healthy = false;
    services.supabase = { status: 'error', error: err?.message, latencyMs: Date.now() - sbStart };
  }

  // ── Circuit breakers ───────────────────────────────────────────────────────
  services.circuitBreakers = getAllBreakerStatus();

  // Mark degraded if any breaker is OPEN
  if (Object.values(services.circuitBreakers).some((b) => b.state === 'OPEN')) {
    healthy = false;
  }

  const body = {
    status: healthy ? 'healthy' : 'degraded',
    version: process.env.npm_package_version || '0.1.0',
    uptimeSeconds: Math.floor((Date.now() - START_TIME) / 1000),
    timestamp: new Date().toISOString(),
    services,
  };

  return NextResponse.json(body, { status: healthy ? 200 : 503 });
}
