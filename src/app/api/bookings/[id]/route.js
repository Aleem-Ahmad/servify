import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const { status, providerId, providerName, visitTime, otp } = await request.json();
    console.log(`PATCH booking id=${id} status=${status} providerId=${providerId} otp=${otp}`);

    if (status === "In-Progress") {
      const booking = await prisma.booking.findUnique({ where: { id } });
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

    const updateData = { status };
    
    if (providerId) {
      updateData.providerId = providerId;
      
      const providerUser = await prisma.user.findUnique({ where: { id: providerId } });
      if (providerUser) {
        updateData.providerName = providerUser.name;
        updateData.providerPhone = providerUser.phone || undefined;
        updateData.hourlyRate = Number(providerUser.rate) || 0;
        
        const booking = await prisma.booking.findUnique({ where: { id } });
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

    const result = await prisma.booking.update({
      where: { id },
      data: updateData
    });

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
  try {
    const { id } = await params;
    let booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        provider: true
      }
    });

    if (!booking) {
      return NextResponse.json({ message: "Booking not found" }, { status: 404 });
    }

    if (!booking.otp) {
      const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
      booking = await prisma.booking.update({
        where: { id },
        data: { otp: generatedOtp },
        include: { provider: true }
      });
    }

    return NextResponse.json({
      id: booking.id,
      customer: booking.customerId,
      provider: booking.providerId,
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
      providerPhone: booking.provider?.phone || booking.providerPhone,
      providerImage: booking.provider?.image || null,
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
