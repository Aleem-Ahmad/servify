import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const UsernameQuerySchema = z.object({
  username: z.string().min(1, "Username is required"),
});

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const queryParam = {
      username: searchParams.get('username')
    };

    // Validate with zod
    const result = UsernameQuerySchema.safeParse(queryParam);
    if (!result.success) {
      const usernameErrors = result.error.format().username?._errors || [];
      return NextResponse.json({
        success: false,
        message: usernameErrors.length > 0 ? usernameErrors.join(', ') : 'Invalid query parameters'
      }, { status: 400 });
    }

    const { username } = result.data;

    const existingVerifiedUser = await prisma.user.findFirst({
      where: { username, isVerified: true }
    });

    if (existingVerifiedUser) {
      return NextResponse.json({
        success: false,
        message: 'Username is already taken'
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Username is available'
    }, { status: 200 });

  } catch (error) {
    console.error("Error checking username uniqueness:", error);
    return NextResponse.json({
      success: false,
      message: "Error checking username: " + (error.message || "Unknown error")
    }, { status: 500 });
  }
}
