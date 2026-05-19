import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import User from '@/models/User';
import mongoose from 'mongoose';

export async function POST(request) {
  await connectDB();
  try {
    const bookingData = await request.json();
    
    // Calculate total price transparently based on hours and provider's hourly rate if provided
    const hourlyRate = Number(bookingData.hourlyRate) || 0;
    const hours = Number(bookingData.hours) || 1;
    const calculatedBudget = hourlyRate > 0 ? (hourlyRate * hours) : (Number(bookingData.price) || 0);

    // mapping frontend fields to backend model
    const newBooking = new Booking({
      customer: new mongoose.Types.ObjectId(bookingData.userId),
      provider: bookingData.providerId ? new mongoose.Types.ObjectId(bookingData.providerId) : undefined,
      service: bookingData.category,
      details: bookingData.description,
      voiceUrl: bookingData.voiceUrl || undefined,
      mediaUrls: bookingData.mediaUrls || [],
      urgency: bookingData.urgency || 'Normal',
      hours: hours,
      hourlyRate: hourlyRate,
      budget: calculatedBudget,
      customerName: bookingData.customerName,
      customerPhone: bookingData.customerPhone,
      customerAddress: bookingData.customerAddress,
      locationStr: bookingData.location,
      providerName: bookingData.providerName,
      date: bookingData.date ? new Date(bookingData.date) : new Date(),
      status: "Pending",
      payment: {
        method: bookingData.paymentMethod || 'Cash',
        status: 'Unpaid'
      }
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
      message: "Failed to process booking: " + error.message
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
      let provIdObj;
      try { provIdObj = new mongoose.Types.ObjectId(providerId); } catch(e) { provIdObj = providerId; }

      // Fetch provider category to show matching open bookings
      const providerUser = await User.findById(providerId);
      const providerCategory = providerUser?.category;

      query = {
        $or: [
          { provider: provIdObj },
          {
            provider: { $exists: false },
            service: providerCategory,
            status: "Pending"
          },
          {
            provider: null,
            service: providerCategory,
            status: "Pending"
          }
        ]
      };
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
      voiceUrl: b.voiceUrl,
      mediaUrls: b.mediaUrls,
      urgency: b.urgency,
      hours: b.hours,
      hourlyRate: b.hourlyRate,
      price: b.budget,
      status: b.status,
      customerName: b.customerName,
      customerPhone: b.customerPhone,
      customerAddress: b.customerAddress,
      location: b.locationStr,
      date: b.date,
      visitTime: b.visitTime,
      paymentMethod: b.payment?.method || 'Cash',
      paymentStatus: b.payment?.status || 'Unpaid',
      createdAt: b.createdAt
    }));

    return NextResponse.json(mappedBookings);
  } catch (error) {
    console.error("GET Bookings error:", error);
    return NextResponse.json({ message: "Failed to fetch bookings" }, { status: 500 });
  }
}
