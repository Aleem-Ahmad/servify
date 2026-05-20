import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const bookingData = await request.json();
    
    // Calculate total price transparently based on hours and provider's hourly rate if provided
    const hourlyRate = Number(bookingData.hourlyRate) || 0;
    const hours = Number(bookingData.hours) || 1;
    const calculatedBudget = hourlyRate > 0 ? (hourlyRate * hours) : (Number(bookingData.price) || 0);

    const otp = bookingData.otp || Math.floor(1000 + Math.random() * 9000).toString();

    const newBooking = await prisma.booking.create({
      data: {
        customerId: bookingData.userId,
        providerId: bookingData.providerId || null,
        service: bookingData.category,
        details: bookingData.description,
        voiceUrl: bookingData.voiceUrl || null,
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
        },
        otp: otp
      }
    });

    return NextResponse.json({
      success: true,
      message: "Booking request submitted successfully!",
      bookingId: newBooking.id,
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
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const providerId = searchParams.get('providerId');

    let query = {};
    if (userId) {
      query.customerId = userId;
    }
    
    if (providerId) {
      const providerUser = await prisma.user.findUnique({ where: { id: providerId } });
      const providerCategory = providerUser?.category;

      query = {
        OR: [
          { providerId: providerId },
          {
            providerId: null,
            service: providerCategory || undefined,
            status: "Pending"
          }
        ]
      };
    }

    let bookings = await prisma.booking.findMany({
      where: query,
      include: {
        provider: {
          select: { name: true, phone: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Robust Auto-OTP Generation and DB Persistence
    for (let b of bookings) {
      if (!b.otp) {
        const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
        b.otp = generatedOtp;
        await prisma.booking.update({
          where: { id: b.id },
          data: { otp: generatedOtp }
        });
      }
    }

    const mappedBookings = bookings.map(b => ({
      id: b.id,
      customer: b.customerId,
      provider: b.providerId,
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
      createdAt: b.createdAt,
      otp: providerId ? undefined : b.otp
    }));

    return NextResponse.json(mappedBookings);
  } catch (error) {
    console.error("GET Bookings error:", error);
    return NextResponse.json({ message: "Failed to fetch bookings" }, { status: 500 });
  }
}
