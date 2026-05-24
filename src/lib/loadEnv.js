import { loadEnvConfig } from '@next/env';

const projectDir = process.cwd();
loadEnvConfig(projectDir);

export function getDatabaseUrl() {
  return process.env.DATABASE_URL?.trim() || '';
}
