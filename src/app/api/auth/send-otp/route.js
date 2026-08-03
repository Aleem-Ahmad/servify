import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import { emailSchema } from "@/Schemas/verifySchema";
import { findUserByEmail } from "@/lib/findUserByEmail";
import { normalizeEmail } from "@/lib/normalizeEmail";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const { email: rawEmail, username } = await request.json();
    const email = normalizeEmail(rawEmail);

    // 1. Validate email format
    const validation = emailSchema.safeParse({ email: rawEmail });
    if (!validation.success) {
      return NextResponse.json({ success: false, message: validation.error.errors[0].message }, { status: 400 });
    }

    // 2. Check if email already belongs to a verified user
    const existingUserByEmail = await findUserByEmail(prisma, email);
    if (existingUserByEmail && existingUserByEmail.isVerified) {
      return NextResponse.json({ success: false, message: "User already exists with this email" }, { status: 400 });
    }

    // 3. Check if username is already taken by a verified user
    if (username) {
      const existingUserByUsername = await prisma.user.findFirst({
        where: { username, isVerified: true }
      });
      if (existingUserByUsername) {
        return NextResponse.json({ success: false, message: "Username is already taken" }, { status: 400 });
      }
    }

    // 4. Clean up any unverified stale users for this email/username to avoid DB unique constraint locks
    await prisma.user.deleteMany({
      where: {
        isVerified: false,
        OR: [
          { email },
          ...(username ? [{ username }] : [])
        ]
      }
    });

    // 5. Generate 6-digit OTP code (10-minute expiry)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // 6. Save verification code to VerifyCode table
    await prisma.verifyCode.deleteMany({ where: { email } });
    await prisma.verifyCode.create({
      data: {
        email,
        code: otp,
        expiresAt
      }
    });

    // 7. Send Verification Email
    console.log(`[DEVELOPMENT] New OTP for ${email}: ${otp}`);
    
    const emailResponse = await sendVerificationEmail(email, username || email.split('@')[0], otp);
    if (!emailResponse.success) {
      return NextResponse.json({ success: false, message: emailResponse.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Verification code sent to your email." });

  } catch (error) {
    console.error("Send OTP Error:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || "An unexpected error occurred while sending verification code." 
    }, { status: 500 });
  }
}

