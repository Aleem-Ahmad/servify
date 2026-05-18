import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import mongoose from 'mongoose';

export async function POST(request) {
  await connectDB();
  try {
    const bookingData = await request.json();
    
    // mapping frontend fields to backend model
    const newBooking = new Booking({
      customer: new mongoose.Types.ObjectId(bookingData.userId),
      provider: new mongoose.Types.ObjectId(bookingData.providerId),
      service: bookingData.category,
      details: bookingData.description,
      budget: bookingData.price || 0,
      customerName: bookingData.customerName,
      customerPhone: bookingData.customerPhone,
      customerAddress: bookingData.customerAddress,
      locationStr: bookingData.location,
      providerName: bookingData.providerName,
      date: bookingData.date ? new Date(bookingData.date) : new Date(),
      status: "Pending",
    });

    await newBooking.save();

    return NextResponse.json({
      success: true,
      message: "Booking request submitted successfully!",
      bookingId: newBooking._id,
      details: newBooking
    });
  } catch (error) {
    console.error("Booking error:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to process booking"
    }, { status: 500 });
  }
}

export async function GET(request) {
  await connectDB();
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const providerId = searchParams.get('providerId');

    let query = {};
    if (userId) {
      try { query.customer = new mongoose.Types.ObjectId(userId); } catch(e) { query.customer = userId; }
    }
    if (providerId) {
      try { query.provider = new mongoose.Types.ObjectId(providerId); } catch(e) { query.provider = providerId; }
    }

    const bookings = await Booking.find(query)
      .populate('provider', 'name phone')
      .sort({ createdAt: -1 });

    const mappedBookings = bookings.map(b => ({
      id: b._id.toString(),
      customer: b.customer?.toString(),
      provider: b.provider?._id?.toString() || b.provider?.toString(),
      providerPhone: b.provider?.phone || null,
      providerName: b.providerName || b.provider?.name,
      category: b.service,
      description: b.details,
      price: b.budget,
      status: b.status,
      customerName: b.customerName,
      customerPhone: b.customerPhone,
      customerAddress: b.customerAddress,
      location: b.locationStr,
      date: b.date,
      createdAt: b.createdAt
    }));

    return NextResponse.json(mappedBookings);
  } catch (error) {
    console.error("GET Bookings error:", error);
    return NextResponse.json({ message: "Failed to fetch bookings" }, { status: 500 });
  }
}
