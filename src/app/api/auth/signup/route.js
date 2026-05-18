import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { signupSchema } from '@/Schemas/signupSchema';
import bcrypt from 'bcryptjs';
import { sendVerificationEmail } from '@/helpers/sendVerificationEmail';
import { uploadImage } from '@/helpers/uploadImage';

export async function POST(request) {
  await connectDB();
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
    console.log("Signup request body keys:", Object.keys(body));
    console.log("Signup request body cnic:", body.cnic);

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
      return NextResponse.json({ success: false, message: "Username is already taken" }, { status: 400 });
    }

    // 3. Check if email is already taken
    const existingUserByEmail = await User.findOne({ email });
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryDate = new Date(Date.now() + 3600000); // 1 hour

    // 4. Handle File Uploads (for providers)
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

    // 4.1 Handle Profile Image Upload
    let profileImageUrl = "";
    if (contentType.includes("multipart/form-data")) {
      const profileFile = formData.get("profile");
      if (profileFile) {
        const res = await uploadImage(profileFile, `servify/users/${username}/profile`);
        if (res) profileImageUrl = res.url;
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (existingUserByEmail) {
      if (existingUserByEmail.isVerified) {
        return NextResponse.json({ success: false, message: "User already exists with this email" }, { status: 400 });
      } else {
        // Update unverified user
        Object.assign(existingUserByEmail, validation.data);
        existingUserByEmail.password = hashedPassword;
        existingUserByEmail.verifyCode = verifyCode;
        existingUserByEmail.verifyCodeExpiry = expiryDate;
        existingUserByEmail.documents = { ...existingUserByEmail.documents, ...documents };
        if (profileImageUrl) existingUserByEmail.image = profileImageUrl;
        await existingUserByEmail.save();
      }
    } else {
      // Create new user
      const newUser = new User({
        ...validation.data,
        password: hashedPassword,
        verifyCode,
        verifyCodeExpiry: expiryDate,
        isVerified: false,
        status: role === 'provider' ? 'Pending' : 'Active',
        documents,
        image: profileImageUrl
      });
      await newUser.save();
    }

    // 5. Send verification email
    console.log(`[DEVELOPMENT] New OTP for ${email}: ${verifyCode}`);
    const emailResponse = await sendVerificationEmail(email, username, verifyCode);
    
    if (!emailResponse.success) {
      return NextResponse.json({ success: false, message: emailResponse.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "User registered successfully. Please verify your email.",
    }, { status: 201 });

  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ success: false, message: error.message || "Server error during registration" }, { status: 500 });
  }
}
