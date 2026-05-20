import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

export async function POST(request) {
  console.log("LOGIN API CALLED!");
  try {
    const { email, password } = await request.json();
    console.log("Login attempt for:", email);

    // 1. Find user by email
    const user = await prisma.user.findUnique({ where: { email } });
    console.log("User found:", user ? "Yes" : "No");

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: "Invalid email or password" 
      }, { status: 401 });
    }

    // 2. Check if user is verified
    if (!user.isVerified) {
      console.log("User not verified");
      return NextResponse.json({ 
        success: false, 
        message: "Please verify your email before logging in." 
      }, { status: 403 });
    }

    // 3. Compare passwords
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    console.log("Password correct:", isPasswordCorrect);
    
    if (!isPasswordCorrect) {
      return NextResponse.json({ 
        success: false, 
        message: "Invalid email or password" 
      }, { status: 401 });
    }

    // 4. Set session cookie
    console.log("Setting cookie...");
    const cookieStore = await cookies();
    cookieStore.set('userId', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });
    console.log("Cookie set.");

    return NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        username: user.username,
        isVerified: user.isVerified,
        status: user.status,
        badge: user.badge,
        phone: user.phone,
        district: user.district,
        tehseel: user.tehseel,
        cnic: user.cnic,
        address: user.address,
        category: user.category,
        experience: user.experience,
        image: user.image,
        trustScore: user.trustScore,
        isOnline: user.isOnline,
        documents: user.documents,
        performance: user.performance
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Server error during login" 
    }, { status: 500 });
  }
}
