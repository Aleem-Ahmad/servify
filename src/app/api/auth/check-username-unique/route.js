import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { z } from "zod";

const UsernameQuerySchema = z.object({
  username: z.string().regex(/^[a-zA-Z0-9_]{3,20}$/, "Username must be 3-20 characters and can only contain letters, numbers, and underscores"),
});

export async function GET(request) {
  await connectDB();
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

    const existingVerifiedUser = await User.findOne({ username, isVerified: true });

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
    console.error("Error checking username:", error);
    return NextResponse.json({
      success: false,
      message: "Error checking username"
    }, { status: 500 });
  }
}
