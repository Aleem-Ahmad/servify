import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const updateData = await request.json();

    // Prevent overwriting ID fields
    delete updateData._id;
    delete updateData.id;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData
    });

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
  try {
    const { id } = await params;
    
    await prisma.user.delete({ where: { id } });

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
