import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { uploadImage } from '@/helpers/uploadImage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ success: false, message: "No file provided" }, { status: 400 });
    }

    const uploadRes = await uploadImage(file, `servify/users/${user.username}/profile`);
    
    if (!uploadRes || !uploadRes.url) {
      return NextResponse.json({ success: false, message: "Upload failed" }, { status: 500 });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { image: uploadRes.url }
    });

    return NextResponse.json({ success: true, url: uploadRes.url });
  } catch (error) {
    console.error("Avatar upload error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
