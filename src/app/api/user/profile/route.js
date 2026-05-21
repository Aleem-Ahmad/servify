import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/user/profile — returns current logged-in user's profile
export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Strip password before returning
    const { password, ...userObj } = user;
    
    return NextResponse.json(userObj);
  } catch (error) {
    console.error("Profile GET error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// PUT /api/user/profile — update current user's profile fields
export async function PUT(request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const updateData = await request.json();

    // Prevent overwriting critical fields
    delete updateData._id;
    delete updateData.id;
    delete updateData.email;
    delete updateData.password;
    delete updateData.role;
    delete updateData.isVerified;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData
    });

    const { password, ...safeUser } = updatedUser;

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: safeUser
    });
  } catch (error) {
    console.error("Profile PUT error:", error);
    return NextResponse.json({
      success: false,
      message: error.message || "Failed to update profile"
    }, { status: 500 });
  }
}
