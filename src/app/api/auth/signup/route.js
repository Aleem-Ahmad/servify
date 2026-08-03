import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { signupSchema } from '@/Schemas/signupSchema';
import bcrypt from 'bcryptjs';
import { uploadImage } from '@/helpers/uploadImage';
import { normalizeEmail } from '@/lib/normalizeEmail';
import { findUserByEmail } from '@/lib/findUserByEmail';
import { sendPushNotification } from '@/app/api/push/send/route';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let body;
    let formData;

    // Handle both JSON and FormData
    if (contentType.includes("multipart/form-data")) {
      formData = await request.formData();
      body = Object.fromEntries(formData.entries());
    } else {
      body = await request.json();
    }

    const email = normalizeEmail(body.email || "");
    const otpCode = (body.otp || body.code || "").trim();

    // 1. Verify OTP from VerifyCode table
    if (!otpCode) {
      return NextResponse.json({ success: false, message: "Verification code (OTP) is required" }, { status: 400 });
    }

    const verifyRecord = await prisma.verifyCode.findFirst({
      where: {
        email,
        code: otpCode,
        expiresAt: { gt: new Date() }
      }
    });

    if (!verifyRecord) {
      return NextResponse.json({ success: false, message: "Invalid or expired verification code" }, { status: 400 });
    }

    // 2. Validate data using Zod
    const validation = signupSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ 
        success: false, 
        message: "Validation failed", 
        errors: validation.error.format() 
      }, { status: 400 });
    }

    const signupData = {
      ...validation.data,
      email,
    };
    const { username, password, role } = signupData;

    // 3. Check if username is already taken by a verified user
    const existingUserVerifiedByUsername = await prisma.user.findFirst({
      where: {
        username,
        isVerified: true
      }
    });

    if (existingUserVerifiedByUsername) {
      return NextResponse.json({ success: false, message: "Username is already taken" }, { status: 400 });
    }

    // 4. Check if email is already taken by a verified user
    const existingUserByEmail = await findUserByEmail(prisma, email);
    if (existingUserByEmail && existingUserByEmail.isVerified) {
      return NextResponse.json({ success: false, message: "User already exists with this email" }, { status: 400 });
    }

    // 5. Delete any unverified stale users for this email/username to avoid DB unique constraint locks
    await prisma.user.deleteMany({
      where: {
        isVerified: false,
        OR: [
          { email },
          { username }
        ]
      }
    });

    // 6. Handle File Uploads (for providers)
    let documents = {};
    if (role === 'provider' && contentType.includes("multipart/form-data")) {
      const cnicFrontFile = formData.get("cnicFront");
      const cnicBackFile = formData.get("cnicBack");

      if (cnicFrontFile) {
        const res = await uploadImage(cnicFrontFile, `servify/providers/${username}/cnic`);
        if (res) documents.cnicFront = res.url;
      }
      if (cnicBackFile) {
        const res = await uploadImage(cnicBackFile, `servify/providers/${username}/cnic`);
        if (res) documents.cnicBack = res.url;
      }
    }

    // 6.1 Handle Profile Image Upload
    let profileImageUrl = "";
    if (contentType.includes("multipart/form-data")) {
      const profileFile = formData.get("profile");
      if (profileFile) {
        const res = await uploadImage(profileFile, `servify/users/${username}/profile`);
        if (res) profileImageUrl = res.url;
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 7. Create fully verified user in database upon OTP success
    const newUser = await prisma.user.create({
      data: {
        ...signupData,
        password: hashedPassword,
        verifyCode: "",
        verifyCodeExpiry: new Date(),
        isVerified: true,
        status: role === 'provider' ? 'Pending' : 'Active',
        documents,
        ...(profileImageUrl && { image: profileImageUrl })
      }
    });

    // 8. Delete used verification code
    await prisma.verifyCode.deleteMany({ where: { email } });

    // 9. Send notifications
    sendPushNotification({
      userId: newUser.id,
      title: '🎉 Welcome to Servify!',
      body: 'Your account has been registered and verified successfully.',
      url: '/',
      type: 'success'
    }).catch(err => console.error('[Push] Signup notify error:', err));

    if (role === 'provider') {
      const adminUser = await prisma.user.findFirst({ where: { role: 'admin' } });
      if (adminUser) {
        sendPushNotification({
          userId: adminUser.id,
          title: '📄 New Provider Verification Request',
          body: `Provider '${username}' has registered and is awaiting verification.`,
          url: '/adminDashboard/providers',
          type: 'info'
        }).catch(err => console.error('[Push] Admin notify error:', err));
      }
    }

    // 10. Set HTTP-only session cookies for instant login
    const response = NextResponse.json({ 
      success: true, 
      message: "Account verified and created successfully!",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        username: newUser.username,
        isVerified: newUser.isVerified,
        status: newUser.status,
        image: newUser.image,
      }
    }, { status: 201 });

    response.cookies.set("userId", newUser.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    response.cookies.set("userRole", newUser.role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;

  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ success: false, message: error.message || "Server error during registration" }, { status: 500 });
  }
}

