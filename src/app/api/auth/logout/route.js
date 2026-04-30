import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  // In Next.js 15+, cookies() must be awaited
  const cookieStore = await cookies();
  cookieStore.delete('userId');
  return NextResponse.json({ success: true, message: "Logged out successfully" });
}
