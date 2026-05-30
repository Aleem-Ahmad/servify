import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        schedule: true,
        offers: true,
      }
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const { password, ...userObj } = user;
    return NextResponse.json(userObj);
  } catch (error) {
    console.error("Provider settings GET error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const { hourlyRate, schedule, offers } = await request.json();

    // 1. Update hourlyRate on User
    await prisma.user.update({
      where: { id: userId },
      data: { hourlyRate: parseFloat(hourlyRate) || 0 }
    });

    // 2. Update or Create Schedule
    if (schedule) {
      await prisma.schedule.upsert({
        where: { providerId: userId },
        update: {
          startHour: schedule.startHour,
          endHour: schedule.endHour,
          daysOfWeek: schedule.daysOfWeek
        },
        create: {
          providerId: userId,
          startHour: schedule.startHour,
          endHour: schedule.endHour,
          daysOfWeek: schedule.daysOfWeek
        }
      });
    }

    // 3. Re-create Offers (simple approach: delete existing and insert new ones)
    if (offers && Array.isArray(offers)) {
      await prisma.offer.deleteMany({
        where: { providerId: userId }
      });
      
      const offersData = offers.map(o => ({
        providerId: userId,
        title: o.title,
        description: o.description || null,
        discountPct: o.discountPct ? parseFloat(o.discountPct) : null,
        validFrom: new Date(o.validFrom),
        validTo: new Date(o.validTo),
      }));

      if (offersData.length > 0) {
        await prisma.offer.createMany({
          data: offersData
        });
      }
    }

    return NextResponse.json({ success: true, message: "Settings updated" });
  } catch (error) {
    console.error("Provider settings POST error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
