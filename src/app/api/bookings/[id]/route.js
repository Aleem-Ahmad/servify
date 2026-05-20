import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import User from '@/models/User';
import mongoose from 'mongoose';

export async function PATCH(request, { params }) {
  await connectDB();
  try {
    const { id } = await params;
    const { status, providerId, providerName, visitTime, otp } = await request.json();
    console.log(`PATCH booking id=${id} status=${status} providerId=${providerId} otp=${otp}`);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "Invalid booking ID" }, { status: 400 });
    }

    // If trying to set status to In-Progress, verify OTP first!
    if (status === "In-Progress") {
      const booking = await Booking.findById(id);
      if (!booking) {
        return NextResponse.json({ success: false, message: "Booking not found" }, { status: 404 });
      }
      if (!booking.otp) {
        return NextResponse.json({ success: false, message: "No verification OTP is set for this booking" }, { status: 400 });
      }
      if (booking.otp !== otp) {
        return NextResponse.json({ success: false, message: "Invalid verification OTP. Please ask the customer for the correct code." }, { status: 400 });
      }
    }

    // Build update object dynamically
    const updateData = { status };
    
    if (providerId) {
      updateData.provider = new mongoose.Types.ObjectId(providerId);
      
      // Fetch provider to get their rate for transparent pricing
      const providerUser = await User.findById(providerId);
      if (providerUser) {
        updateData.providerName = providerUser.name;
        updateData.providerPhone = providerUser.phone;
        updateData.hourlyRate = Number(providerUser.rate) || 0;
        
        // Update the total budget based on the hours of this booking
        const booking = await Booking.findById(id);
        if (booking) {
          const hours = Number(booking.hours) || 1;
          updateData.budget = (Number(providerUser.rate) || 0) * hours;
        }
      }
    }
    
    if (providerName && !updateData.providerName) {
      updateData.providerName = providerName;
    }
    
    if (visitTime) {
      updateData.visitTime = new Date(visitTime);
    }

    const result = await Booking.findByIdAndUpdate(id, updateData, { new: true });
    console.log("Update result:", result ? "found" : "not found");

    if (!result) {
      return NextResponse.json({ success: false, message: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Booking status updated to ${status}`,
      details: result
    });
  } catch (error) {
    console.error("PATCH Booking error:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to update booking status"
    }, { status: 500 });
  }
}

export async function GET(request, { params }) {
  await connectDB();
  try {
    const { id } = await params;
    const booking = await Booking.findById(id);

    if (!booking) {
      return NextResponse.json({ message: "Booking not found" }, { status: 404 });
    }

    if (!booking.otp) {
      const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
      booking.otp = generatedOtp;
      await Booking.updateOne({ _id: booking._id }, { $set: { otp: generatedOtp } });
    }

    let providerUser = null;
    if (booking.provider) {
      providerUser = await User.findById(booking.provider);
    }

    return NextResponse.json({
      id: booking._id.toString(),
      customer: booking.customer,
      provider: booking.provider,
      category: booking.service,
      description: booking.details,
      voiceUrl: booking.voiceUrl,
      mediaUrls: booking.mediaUrls,
      urgency: booking.urgency,
      hours: booking.hours,
      hourlyRate: booking.hourlyRate,
      price: booking.budget,
      status: booking.status,
      customerName: booking.customerName,
      customerPhone: booking.customerPhone,
      customerAddress: booking.customerAddress,
      location: booking.locationStr,
      providerName: booking.providerName,
      providerPhone: providerUser?.phone || booking.providerPhone,
      providerImage: providerUser?.image || null,
      date: booking.date,
      visitTime: booking.visitTime,
      paymentMethod: booking.payment?.method || 'Cash',
      paymentStatus: booking.payment?.status || 'Unpaid',
      createdAt: booking.createdAt,
      otp: booking.otp
    });
  } catch (error) {
    console.error("GET Booking error:", error);
    return NextResponse.json({ message: "Failed to fetch booking details" }, { status: 500 });
  }
}
