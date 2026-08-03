import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';

// Manually load env
const envContent = readFileSync(join(process.cwd(), '.env.local'), 'utf8');
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eq = trimmed.indexOf('=');
  if (eq === -1) continue;
  const key = trimmed.slice(0, eq).trim();
  const val = trimmed.slice(eq + 1).trim().replace(/^"|"$/g, '');
  if (!process.env[key]) process.env[key] = val;
}

const prisma = new PrismaClient();

try {
  const providers = await prisma.user.findMany({
    where: { role: 'provider' },
    select: { id: true, name: true, status: true, category: true }
  });
  console.log('Total providers:', providers.length);
  if (providers.length > 0) {
    console.log(JSON.stringify(providers.slice(0, 5), null, 2));
  }
  
  const activeProviders = await prisma.user.findMany({
    where: { role: 'provider', status: 'Active' },
    select: { id: true, name: true, status: true, category: true }
  });
  console.log('\nActive providers:', activeProviders.length);
} catch (e) {
  console.error('Error:', e.message);
} finally {
  await prisma.$disconnect();
}
