import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcryptjs from "bcryptjs";
import { findUserByEmail } from "@/lib/findUserByEmail";
import { normalizeEmail } from "@/lib/normalizeEmail";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const { email: rawEmail, otp, newPassword } = await request.json();
    
    if (!rawEmail || !otp || !newPassword) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    const email = normalizeEmail(rawEmail);
    const user = await findUserByEmail(prisma, email);

    if (!user) {
      return NextResponse.json({ success: false, message: "Invalid verification code." }, { status: 400 });
    }

    // Verify OTP
    if (user.verifyCode !== otp) {
      return NextResponse.json({ success: false, message: "Incorrect verification code." }, { status: 400 });
    }

    const isCodeExpired = new Date(user.verifyCodeExpiry) < new Date();
    if (isCodeExpired) {
      return NextResponse.json({ success: false, message: "Verification code has expired. Please request a new one." }, { status: 400 });
    }

    // Hash new password
    const hashedPassword = await bcryptjs.hash(newPassword, 10);

    // Update password and clear OTP
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        verifyCode: "", // Clear the code so it can't be reused
        verifyCodeExpiry: new Date(0)
      }
    });

    return NextResponse.json({ success: true, message: "Password has been successfully reset." });

  } catch (error) {
    console.error("Reset Password Error:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || "An unexpected error occurred." 
    }, { status: 500 });
  }
}
