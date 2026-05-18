import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function PATCH(request, { params }) {
  await connectDB();
  try {
    const { id } = await params;
    const updateData = await request.json();

    // Prevent overwriting ID fields
    delete updateData._id;
    delete updateData.id;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "User updated successfully"
    });
  } catch (error) {
    console.error("Admin user update error:", error);
    return NextResponse.json({
      success: false,
      message: error.message || "Failed to update user"
    }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  await connectDB();
  try {
    const { id } = await params;
    
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (error) {
    console.error("Admin user delete error:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to delete user"
    }, { status: 500 });
  }
}
