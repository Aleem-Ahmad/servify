import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

// Optional: you could add an admin check here by reading the cookie, 
// fetching the user, and ensuring role === 'admin'.

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const updateData = await request.json();

    // Prevent overwriting the id itself just in case
    delete updateData.id;
    delete updateData._id;

    const result = await db.collection('users').update({ id }, updateData);

    if (result.updatedCount === 0) {
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
      message: "Failed to update user"
    }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    const result = await db.collection('users').delete({ id });

    if (result.deletedCount === 0) {
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
