import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    // 1. Check if the requester is an admin
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, message: "Unauthorized access" }, { status: 403 });
    }

    const { name, email, password } = await request.json();

    // 2. Validate input
    if (!name || !email || !password) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    await connectDB();

    // 3. Check if admin already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json({ success: false, message: "User already exists" }, { status: 400 });
    }

    // 4. Create new admin
    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "admin",
      status: "Active",
      phone: "03000000000", // Default placeholders for admins
      district: "System",
      tehseel: "System",
      cnic: "00000-0000000-0",
    });

    return NextResponse.json({ 
      success: true, 
      message: `Admin ${name} created successfully` 
    });

  } catch (error) {
    console.error("Add Admin Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
