import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;
    
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    }

    const { endpoint, keys } = await request.json();

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json({ success: false, message: 'Invalid subscription object' }, { status: 400 });
    }

    // Upsert the subscription (if endpoint exists, update it, otherwise create)
    await prisma.pushSubscription.upsert({
      where: { endpoint },
      update: {
        userId,
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
      create: {
        userId,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
      }
    });

    return NextResponse.json({ success: true, message: 'Subscription saved' });
  } catch (error) {
    console.error('Push Subscribe Error:', error);
    return NextResponse.json({ success: false, message: 'Failed to save subscription' }, { status: 500 });
  }
}
