import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request) {
  try {
    const userData = await request.json();

    // Check if user already exists
    const existing = await db.collection('users').findOne({ email: userData.email });
    if (existing) {
      return NextResponse.json({ success: false, message: "User already exists" }, { status: 400 });
    }

    const newUser = await db.collection('users').insertOne({
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: userData.role,
      phone: userData.phone,
      city: userData.city,
      cnic: userData.cnic,
      address: userData.address || null,
      gender: userData.gender || null,
      religion: userData.religion || null,
      maritalStatus: userData.maritalStatus || null,
      dob: userData.dob || null,
      category: userData.category || null,
      experience: userData.experience || null,
    });

    return NextResponse.json({ 
      success: true, 
      message: "Registration successful!",
      user: { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role }
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Server error during registration" 
    }, { status: 500 });
  }
}
