import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { signupSchema } from '@/Schemas/signupSchema';
import bcrypt from 'bcryptjs';
import { sendVerificationEmail } from '@/helpers/sendVerificationEmail';

export async function POST(request) {
  await connectDB();
  try {
    const body = await request.json();

    // 1. Validate data using Zod
    const validation = signupSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ 
        success: false, 
        message: "Validation failed", 
        errors: validation.error.format() 
      }, { status: 400 });
    }

    const { username, email, password, role } = validation.data;

    // 2. Check if username is already taken by a verified user
    const existingUserVerifiedByUsername = await User.findOne({
      username,
      isVerified: true
    });

    if (existingUserVerifiedByUsername) {
      return NextResponse.json({
        success: false,
        message: "Username is already taken"
      }, { status: 400 });
    }

    // 3. Check if email is already taken
    const existingUserByEmail = await User.findOne({ email });
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    if (existingUserByEmail) {
      if (existingUserByEmail.isVerified) {
        return NextResponse.json({
          success: false,
          message: "User already exists with this email"
        }, { status: 400 });
      } else {
        // User exists but not verified, update their details
        const hashedPassword = await bcrypt.hash(password, 10);
        existingUserByEmail.password = hashedPassword;
        existingUserByEmail.verifyCode = verifyCode;
        existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000); // 1 hour
        await existingUserByEmail.save();
      }
    } else {
      // Create new user
      const hashedPassword = await bcrypt.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);

      const newUser = new User({
        ...validation.data,
        password: hashedPassword,
        verifyCode,
        verifyCodeExpiry: expiryDate,
        isVerified: false,
        status: role === 'provider' ? 'Pending' : 'Active',
      });

      await newUser.save();
    }

    // 4. Send verification email
    const emailResponse = await sendVerificationEmail(email, username, verifyCode);
    if (!emailResponse.success) {
      return NextResponse.json({
        success: false,
        message: emailResponse.message
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "User registered successfully. Please verify your email.",
    }, { status: 201 });

  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Server error during registration" 
    }, { status: 500 });
  }
}
