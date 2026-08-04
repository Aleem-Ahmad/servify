import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { eventBus, EVENTS } from '@/lib/eventBus';
import { withRetry } from '@/lib/retry';
import { bookingRateLimit } from '@/lib/rateLimit';
import { sendPushNotification } from '@/app/api/push/send/route';

export const dynamic = 'force-dynamic';

export async function PATCH(request, { params }) {
  // Rate limiting
  const rl = await bookingRateLimit(request);
  if (!rl.allowed) return rl.response;

  try {
    const { id } = await params;
    const { status, providerId, providerName, visitTime, otp } = await request.json();
    console.log(`PATCH booking id=${id} status=${status} providerId=${providerId} otp=${otp}`);

    if (status === "In-Progress") {
      const booking = await withRetry(
        () => prisma.booking.findUnique({ where: { id } }),
        { label: 'find-booking-otp-check', retries: 2 }
      );
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
      
      const providerUser = await withRetry(
        () => prisma.user.findUnique({ where: { id: providerId } }),
        { label: 'find-provider-user', retries: 2 }
      );
      if (providerUser) {
        updateData.providerName = providerUser.name;
        updateData.providerPhone = providerUser.phone || undefined;
        updateData.hourlyRate = Number(providerUser.rate) || 0;
        
        const booking = await withRetry(
          () => prisma.booking.findUnique({ where: { id } }),
          { label: 'find-booking-hours', retries: 2 }
        );
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

    const result = await withRetry(
      () => prisma.booking.update({ where: { id }, data: updateData }),
      { label: 'update-booking-status', retries: 3 }
    );

    // ── Publish event to the message bus ──────────────────────────────────────
    const eventMap = {
      'Accepted':    EVENTS.BOOKING_ACCEPTED,
      'Cancelled':   EVENTS.BOOKING_CANCELLED,
      'Completed':   EVENTS.BOOKING_COMPLETED,
      'Rejected':    EVENTS.BOOKING_REJECTED,
      'In-Progress': EVENTS.BOOKING_IN_PROGRESS,
    };
    const eventName = eventMap[status];
    if (eventName) {
      eventBus.publish(eventName, {
        bookingId: id,
        status,
        providerId: result.providerId,
        customerId: result.customerId,
        providerName: result.providerName,
        customerName: result.customerName,
      }).catch((err) => console.error('[EventBus] publish error:', err));
    }

    // ── Push Notifications ──────────────────────────────────────────────────
    if (status === 'Accepted') {
      sendPushNotification({
        userId: result.customerId,
        title: '🎉 Provider Accepted Your Booking!',
        body: `${result.providerName || 'A provider'} accepted your request and is heading your way.`,
        url: `/customerDashboard/track/${id}`,
        type: 'success'
      }).catch(err => console.error('[Push] error:', err));
    }
    else if (status === 'Cancelled') {
      // If a provider was assigned, notify them. Customer also if provider cancelled.
      if (result.providerId) {
        sendPushNotification({
          userId: result.providerId,
          title: '⚠️ Booking Cancelled',
          body: `Service request #${id.slice(0, 8)} was cancelled.`,
          url: '/providerDashboard',
          type: 'alert'
        }).catch(err => console.error('[Push] error:', err));
      }
      sendPushNotification({
        userId: result.customerId,
        title: '⚠️ Booking Cancelled',
        body: `Service request #${id.slice(0, 8)} was cancelled.`,
        url: `/customerDashboard/track/${id}`,
        type: 'alert'
      }).catch(err => console.error('[Push] error:', err));
    }
    else if (status === 'Completed') {
      sendPushNotification({
        userId: result.customerId,
        title: '✨ Job Finished!',
        body: `Your provider completed the work. Please leave feedback!`,
        url: `/customerDashboard/track/${id}`,
        type: 'success'
      }).catch(err => console.error('[Push] error:', err));
    }
    else if (status === 'Rejected') {
      sendPushNotification({
        userId: result.customerId,
        title: '❌ Request Declined',
        body: `The provider declined your booking request.`,
        url: `/customerDashboard/track`,
        type: 'alert'
      }).catch(err => console.error('[Push] error:', err));
    }
    else if (status === 'In-Progress') {
      sendPushNotification({
        userId: result.customerId,
        title: '🚗 Provider is on the way!',
        body: `${result.providerName || 'Your provider'} has started the job and is on the way.`,
        url: `/customerDashboard/track/${id}`,
        type: 'info'
      }).catch(err => console.error('[Push] error:', err));
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
  try {
    const { id } = await params;
    let booking = await withRetry(
      () => prisma.booking.findUnique({ where: { id }, include: { provider: true } }),
      { label: 'get-booking', retries: 2 }
    );

    if (!booking) {
      return NextResponse.json({ message: "Booking not found" }, { status: 404 });
    }

    if (!booking.otp) {
      const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
      booking = await withRetry(
        () => prisma.booking.update({
          where: { id },
          data: { otp: generatedOtp },
          include: { provider: true }
        }),
        { label: 'set-booking-otp', retries: 2 }
      );
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
      agreedPrice: booking.agreedPrice || null,
      status: booking.status,
      bargainingStatus: booking.bargainingStatus || null,
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
