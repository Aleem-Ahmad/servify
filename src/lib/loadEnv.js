import { loadEnvConfig } from '@next/env';

const projectDir = process.cwd();
loadEnvConfig(projectDir);

/** Supabase project — single source of truth for Servify */
export const SUPABASE_PROJECT_REF = 'stvjosvtexdiuqgmikhl';
export const SUPABASE_URL = `https://${SUPABASE_PROJECT_REF}.supabase.co`;

export function getDatabaseUrl() {
  return process.env.DATABASE_URL?.trim() || '';
}

export function getDirectUrl() {
  return process.env.DIRECT_URL?.trim() || '';
}

/** Prisma + Supabase PostgreSQL requires both pooler and direct URLs */
export function isDatabaseConfigured() {
  return Boolean(getDatabaseUrl() && getDirectUrl());
}

export function getDatabaseConfigError() {
  const missing = [];
  if (!getDatabaseUrl()) missing.push('DATABASE_URL');
  if (!getDirectUrl()) missing.push('DIRECT_URL');
  if (missing.length === 0) return null;
  return `Supabase database is not configured. Set ${missing.join(' and ')} in .env.local (local) or Vercel Environment Variables (production). Use Supabase → Settings → Database → Connection strings (Transaction pooler + Direct).`;
}
