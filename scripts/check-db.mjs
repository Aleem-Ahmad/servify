import { readFileSync, existsSync } from 'fs';
import { PrismaClient } from '@prisma/client';

function loadEnvFile(name) {
  if (!existsSync(name)) return;
  for (const line of readFileSync(name, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvFile('.env');
loadEnvFile('.env.local');

if (!process.env.DATABASE_URL || !process.env.DIRECT_URL) {
  console.error('Supabase not configured. Set DATABASE_URL and DIRECT_URL in .env.local or Vercel.');
  process.exit(1);
}

const prisma = new PrismaClient();

try {
  await prisma.$queryRaw`SELECT 1`;
  console.log('Supabase connection: OK');

  const tables = await prisma.$queryRaw`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name`;
  console.log('Tables:', tables);

  const counts = {
    User: await prisma.user.count(),
    Booking: await prisma.booking.count(),
    Review: await prisma.review.count(),
    VerifyCode: await prisma.verifyCode.count(),
  };
  console.log('Row counts:', counts);
} catch (e) {
  console.error('Supabase DB check failed:', e.message);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
