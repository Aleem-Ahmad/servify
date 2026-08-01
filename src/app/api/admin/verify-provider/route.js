import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendPushNotification } from '@/app/api/push/send/route';

export async function POST(request) {
  try {
    const { providerId, action, badge, surveyDate } = await request.json();

    const user = await prisma.user.findUnique({ where: { id: providerId } });
    if (!user) {
      return NextResponse.json({ success: false, message: "Provider not found" }, { status: 404 });
    }

    let updateData = {};

    if (action === 'approve') {
      updateData.status = 'Active';
      updateData.isVerified = true;
      updateData.badge = badge || 'Basic';
      updateData.trustScore = badge === 'Elite' ? 95 : (badge === 'Pro' ? 80 : 60);
    } else if (action === 'reject') {
      updateData.status = 'Blocked';
    } else if (action === 'assign-survey') {
      if (!surveyDate) {
        return NextResponse.json({ success: false, message: "Survey date is required" }, { status: 400 });
      }
      updateData.surveyDate = new Date(surveyDate);
      await prisma.user.update({ where: { id: providerId }, data: updateData });
      return NextResponse.json({ 
        success: true, 
        message: `Survey date assigned successfully for ${new Date(surveyDate).toLocaleDateString()}.` 
      });
    }

    await prisma.user.update({ where: { id: providerId }, data: updateData });

    if (action === 'approve') {
      sendPushNotification({
        userId: providerId,
        title: '🏅 You are now a Verified Provider!',
        body: `Your account has been approved with a ${badge || 'Basic'} badge.`,
        url: '/providerDashboard',
        type: 'success'
      }).catch(err => console.error('[Push] Verify approve error:', err));
    } else if (action === 'reject') {
      sendPushNotification({
        userId: providerId,
        title: '📄 Verification Rejected',
        body: 'Your verification was rejected. Please re-upload your documents.',
        url: '/providerDashboard',
        type: 'alert'
      }).catch(err => console.error('[Push] Verify reject error:', err));
    }

    return NextResponse.json({ 
      success: true, 
      message: `Provider ${action}d successfully with ${badge || 'Basic'} badge.` 
    });

  } catch (error) {
    console.error("Verification decision error:", error);
    return NextResponse.json({ success: false, message: "Error processing decision" }, { status: 500 });
  }
}
