import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import { emailSchema } from "@/Schemas/verifySchema";

export async function POST(request) {
  try {
    const { email } = await request.json();

    // 1. Validate email
    const validation = emailSchema.safeParse({ email });
    if (!validation.success) {
      return NextResponse.json({ success: false, message: validation.error.errors[0].message }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // If user not found, we might want to check if they are in the middle of signup
      return NextResponse.json({ success: false, message: "User not found with this email. Please sign up first." }, { status: 404 });
    }

    // 2. Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const verifyCodeExpiry = new Date(Date.now() + 3600000); // 1 hour
    
    await prisma.user.update({
      where: { email },
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
