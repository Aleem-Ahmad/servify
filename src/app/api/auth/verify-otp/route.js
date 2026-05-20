import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifySchema } from "@/Schemas/verifySchema";

export async function POST(request) {
  try {
    const { email, code } = await request.json();

    // 1. Validate code format
    const validation = verifySchema.safeParse({ code });
    if (!validation.success) {
      return NextResponse.json({ success: false, message: validation.error.errors[0].message }, { status: 400 });
    }

    // 2. Find the user in database
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    // 3. Check if code matches and not expired
    const isCodeValid = user.verifyCode === code;
    const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();

    if (isCodeValid && isCodeNotExpired) {
      await prisma.user.update({
        where: { email },
        data: {
          isVerified: true
        }
      });
      return NextResponse.json({ success: true, message: "Account verified successfully" });
    } else if (!isCodeNotExpired) {
      return NextResponse.json({ success: false, message: "Verification code has expired. Please signup again to get a new code." }, { status: 400 });
    } else {
      return NextResponse.json({ success: false, message: "Incorrect verification code" }, { status: 400 });
    }

  } catch (error) {
    console.error("Verify OTP Error:", error);
    return NextResponse.json({ success: false, message: "Verification failed" }, { status: 500 });
  }
}
