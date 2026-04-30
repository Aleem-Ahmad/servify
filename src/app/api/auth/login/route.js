import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    const user = await db.collection('users').findOne({ email, password });

    if (user) {
      // In Next.js 15+, cookies() must be awaited
      const cookieStore = await cookies();
      cookieStore.set('userId', user.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
      });

      return NextResponse.json({ 
        success: true, 
        message: "Login successful", 
        user: { id: user.id, name: user.name, email: user.email, role: user.role } 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: "Invalid email or password" 
      }, { status: 401 });
    }
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Server error during login" 
    }, { status: 500 });
  }
}
