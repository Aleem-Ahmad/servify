import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { seed } from '@/lib/seed';

export async function GET() {
  await seed(); // Ensure DB is seeded on first hit
  const services = await db.collection('services').find();
  return NextResponse.json(services);
}
