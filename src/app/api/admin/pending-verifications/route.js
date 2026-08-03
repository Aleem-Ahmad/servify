import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Fetch users with role provider and status Pending who have verified their OTP
    const pendingProviders = await prisma.user.findMany({ 
      where: {
        role: 'provider',
        status: 'Pending',
        isVerified: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, providers: pendingProviders });
  } catch (error) {
    console.error("Error fetching requests:", error);
    return NextResponse.json({ success: false, message: "Error fetching requests" }, { status: 500 });
  }
}
