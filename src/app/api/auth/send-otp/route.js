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
    const { email: rawEmail } = await request.json();
    const email = normalizeEmail(rawEmail);

    // 1. Validate email
    const validation = emailSchema.safeParse({ email: rawEmail });
    if (!validation.success) {
      return NextResponse.json({ success: false, message: validation.error.errors[0].message }, { status: 400 });
    }

    const user = await findUserByEmail(prisma, email);
    if (!user) {
      // If user not found, we might want to check if they are in the middle of signup
      return NextResponse.json({ success: false, message: "User not found with this email. Please sign up first." }, { status: 404 });
    }

    // 2. Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const verifyCodeExpiry = new Date(Date.now() + 3600000); // 1 hour
    
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verifyCode: otp,
        verifyCodeExpiry
      }
    });

    // 3. Send Email
    console.log(`[DEVELOPMENT] New OTP for ${email}: ${otp}`);
    
    const emailResponse = await sendVerificationEmail(email, user.username, otp);
    if (!emailResponse.success) {
      return NextResponse.json({ success: false, message: emailResponse.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "New verification code sent to your email." });

  } catch (error) {
    console.error("Resend OTP Error:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || "An unexpected error occurred during OTP resending." 
    }, { status: 500 });
  }
}
