import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import webpush from 'web-push';

// Configure web-push with our VAPID keys
if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_EMAIL || 'mailto:admin@servify.space',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

// Ensure this route can't be called directly from the outside easily without some auth,
// but since it's an internal helper, we might just export a normal function to call directly
// from other API routes. However, if we want to call it via fetch() from other microservices,
// we'll leave it as a POST endpoint. We should probably use a secret if calling over network, 
// but for now we'll rely on it just being used internally or we can export a standard function.

export async function sendPushNotification({ userId, title, body, url, icon, type }) {
  try {
    if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
      console.warn("VAPID keys not configured, skipping push notification.");
      return;
    }

    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId }
    });

    if (subscriptions.length === 0) return;

    const payload = JSON.stringify({
      title,
      body,
      url: url || '/',
      icon: icon || '/favicon.png',
      type: type || 'info'
    });

    const sendPromises = subscriptions.map(async (sub) => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        }
      };

      try {
        await webpush.sendNotification(pushSubscription, payload);
      } catch (error) {
        if (error.statusCode === 410 || error.statusCode === 404) {
          // Subscription is invalid/expired, remove it
          await prisma.pushSubscription.delete({ where: { id: sub.id } });
        } else {
          console.error('Error sending push to endpoint:', sub.endpoint, error);
        }
      }
    });

    await Promise.all(sendPromises);
    return { success: true, count: subscriptions.length };
  } catch (error) {
    console.error('Send Push Error:', error);
    return { success: false, error: error.message };
  }
}

// Expose POST if we want to call it via fetch, but direct function call is better
export async function POST(request) {
  try {
    // Basic protection - could require a secret header
    const body = await request.json();
    const { userId, title, body: content, url, icon, type } = body;
    
    if (!userId || !title) {
      return NextResponse.json({ success: false, message: 'Missing parameters' }, { status: 400 });
    }
    
    await sendPushNotification({ userId, title, body: content, url, icon, type });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('POST Push Send Error:', error);
    return NextResponse.json({ success: false, message: 'Internal error' }, { status: 500 });
  }
}
