import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import { findUserByEmail } from "@/lib/findUserByEmail";
import { normalizeEmail } from "@/lib/normalizeEmail";
import { sendPushNotification } from '@/app/api/push/send/route';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const { email: rawEmail } = await request.json();
    if (!rawEmail) {
      return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 });
    }

    const email = normalizeEmail(rawEmail);

    const user = await findUserByEmail(prisma, email);
    if (!user) {
      // Don't leak whether an email exists or not for security, but we return a generic message
      return NextResponse.json({ success: true, message: "If that email exists, we've sent a code." });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const verifyCodeExpiry = new Date(Date.now() + 3600000); // 1 hour
    
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verifyCode: otp,
        verifyCodeExpiry
      }
    });

    // Send Email
    console.log(`[DEVELOPMENT] Forgot Password OTP for ${email}: ${otp}`);
    
    const emailResponse = await sendVerificationEmail(email, user.name || user.username, otp);
    if (!emailResponse.success) {
      return NextResponse.json({ success: false, message: "Failed to send email. Please try again." }, { status: 500 });
    }

    sendPushNotification({
      userId: user.id,
      title: '🔑 Password Reset Requested',
      body: 'A password reset was requested for your account.',
      url: '/',
      type: 'info'
    }).catch(err => console.error('[Push] Forgot password notify error:', err));

    return NextResponse.json({ success: true, message: "If that email exists, we've sent a code." });

  } catch (error) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || "An unexpected error occurred." 
    }, { status: 500 });
  }
}
