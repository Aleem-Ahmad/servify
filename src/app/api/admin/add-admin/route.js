import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await connectDB();
    
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;
    
    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized access" }, { status: 401 });
    }

    const requester = await User.findById(userId);
    
    // ONLY owner admin can add admins
    if (!requester || requester.email !== 'www.aleemahmadghias@gmail.com') {
      return NextResponse.json({ success: false, message: "Forbidden: Only the Owner Admin can add new admins" }, { status: 403 });
    }

    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    // 3. Check if admin already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json({ success: false, message: "User already exists" }, { status: 400 });
    }

    // 4. Create new admin
    const hashedPassword = await bcrypt.hash(password, 10);
    const emailPrefix = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const username = `admin_${emailPrefix}_${randomSuffix}`;

    const newAdmin = await User.create({
      name,
      email,
      username,
      password: hashedPassword,
      role: "admin",
      status: "Active",
      isVerified: true,
      verifyCode: "000000",
      verifyCodeExpiry: new Date(Date.now() + 3600000),
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
    return NextResponse.json({ success: false, message: error.message || "Server error" }, { status: 500 });
  }
}
