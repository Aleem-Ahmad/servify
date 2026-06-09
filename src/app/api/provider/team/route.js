import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/provider/team — list team members
export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;
    if (!userId) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const members = await prisma.teamMember.findMany({
      where: { providerId: userId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error("Team GET error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// POST /api/provider/team — add a team member
export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;
    if (!userId) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const { name, role, phone, cnic } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ message: "Name is required" }, { status: 400 });
    }

    const member = await prisma.teamMember.create({
      data: {
        providerId: userId,
        name: name.trim(),
        role: role || "Technician",
        phone: phone || null,
        cnic: cnic || null,
      }
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error("Team POST error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// DELETE /api/provider/team?id=memberId — remove a team member
export async function DELETE(request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;
    if (!userId) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('id');

    if (!memberId) {
      return NextResponse.json({ message: "Member ID required" }, { status: 400 });
    }

    // Verify ownership
    const member = await prisma.teamMember.findUnique({ where: { id: memberId } });
    if (!member || member.providerId !== userId) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    await prisma.teamMember.delete({ where: { id: memberId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Team DELETE error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
