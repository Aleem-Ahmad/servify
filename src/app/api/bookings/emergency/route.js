import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    let providerId = searchParams.get("providerId");

    if (!providerId) {
      const cookieStore = await cookies();
      providerId = cookieStore.get("userId")?.value;
    }

    if (!providerId) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: providerId },
      select: { category: true }
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const emergencies = await prisma.booking.findMany({
      where: {
        urgency: "Emergency",
        status: "Pending",
        service: user.category // Only show emergencies matching provider's category
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(emergencies);
  } catch (error) {
    console.error("Emergency bookings GET error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
