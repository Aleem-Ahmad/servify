import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  await connectDB();
  try {
    // Fetch users with role provider and status Pending (or has documents)
    const pendingProviders = await User.find({ 
      role: 'provider',
      $or: [
        { status: 'Pending' },
        { "documents.cnicFront": { $exists: true } }
      ]
    }).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, providers: pendingProviders });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Error fetching requests" }, { status: 500 });
  }
}
