import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { findUserByEmail } from '@/lib/findUserByEmail';
import { normalizeEmail } from '@/lib/normalizeEmail';
import { getDatabaseUrl } from '@/lib/loadEnv.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    if (!getDatabaseUrl()) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Database is not configured. Add DATABASE_URL to .env (and .env.local for Next.js), then restart the dev server.',
        },
        { status: 503 }
      );
    }

    const body = await request.json();
    const email = normalizeEmail(body.email);
    const password = body.password;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = await findUserByEmail(prisma, email);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (!user.isVerified) {
      return NextResponse.json(
        { success: false, message: 'Please verify your email before logging in.' },
        { status: 403 }
      );
    }

    if (!user.password) {
      return NextResponse.json(
        {
          success: false,
          message: 'This account has no password set. Sign up again or contact support.',
        },
        { status: 401 }
      );
    }

    const isPasswordCorrect = await bcrypt.compare(String(password), user.password);

    if (!isPasswordCorrect) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
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
        performance: user.performance,
      },
    });

    response.cookies.set('userId', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Server error during login',
        ...(process.env.NODE_ENV === 'development' && { detail: error.message }),
      },
      { status: 500 }
    );
  }
}
