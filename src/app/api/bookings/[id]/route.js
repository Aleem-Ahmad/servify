import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import mongoose from 'mongoose';

export async function PATCH(request, { params }) {
  await connectDB();
  try {
    const { id } = await params;
    const { status } = await request.json();
    console.log(`PATCH booking id=${id} status=${status}`);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "Invalid booking ID" }, { status: 400 });
    }

    const result = await Booking.findByIdAndUpdate(id, { status }, { new: true });
    console.log("Update result:", result ? "found" : "not found");

    if (!result) {
      return NextResponse.json({ success: false, message: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Booking status updated to ${status}`
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

    return NextResponse.json({
      id: booking._id.toString(),
      customer: booking.customer,
      provider: booking.provider,
      category: booking.service,
      description: booking.details,
      price: booking.budget,
      status: booking.status,
      customerName: booking.customerName,
      customerPhone: booking.customerPhone,
      customerAddress: booking.customerAddress,
      location: booking.locationStr,
      providerName: booking.providerName,
      date: booking.date,
      createdAt: booking.createdAt
    });
  } catch (error) {
    console.error("GET Booking error:", error);
    return NextResponse.json({ message: "Failed to fetch booking details" }, { status: 500 });
  }
}
