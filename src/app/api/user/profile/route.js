import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { cookies } from 'next/headers';

// GET /api/user/profile — returns current logged-in user's profile
export async function GET() {
  await connectDB();
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    // Use findById for MongoDB/Mongoose
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Strip password before returning
    const userObj = user.toObject();
    delete userObj.password;
    userObj.id = user._id.toString(); // ensure 'id' always present
    
    return NextResponse.json(userObj);
  } catch (error) {
    console.error("Profile GET error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// PUT /api/user/profile — update current user's profile fields
export async function PUT(request) {
  await connectDB();
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const updateData = await request.json();

    // Prevent overwriting critical fields
    delete updateData._id;
    delete updateData.email;
    delete updateData.password;
    delete updateData.role;
    delete updateData.isVerified;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("Profile PUT error:", error);
    return NextResponse.json({
      success: false,
      message: error.message || "Failed to update profile"
    }, { status: 500 });
  }
}
