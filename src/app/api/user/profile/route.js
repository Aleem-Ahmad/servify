import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

// GET /api/user/profile — returns current logged-in user's profile
export async function GET() {
  try {
    // In Next.js 15+, cookies() must be awaited
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const user = await db.collection('users').findOne({ id: userId });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Strip password before returning
    const { password, ...userProfile } = user;
    return NextResponse.json(userProfile);
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
    delete updateData.id;
    delete updateData._id;
    delete updateData.email;
    delete updateData.password;
    delete updateData.role;

    const result = await db.collection('users').update({ id: userId }, updateData);

    if (result.updatedCount === 0) {
      return NextResponse.json({ success: false, message: "No changes made" });
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully"
    });
  } catch (error) {
    console.error("Profile PUT error:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to update profile"
    }, { status: 500 });
  }
}
