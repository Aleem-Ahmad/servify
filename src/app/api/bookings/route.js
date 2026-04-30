import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request) {
  try {
    const bookingData = await request.json();
    const newBooking = await db.collection('bookings').insertOne({
        ...bookingData,
        status: "Pending",
        otp: Math.floor(1000 + Math.random() * 9000).toString()
    });

    return NextResponse.json({
      success: true,
      message: "Booking request submitted successfully!",
      bookingId: newBooking.id,
      details: newBooking
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Failed to process booking"
    }, { status: 500 });
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const providerId = searchParams.get('providerId');

  let query = {};
  if (userId) query.userId = userId;
  if (providerId) query.providerId = providerId;

  const bookings = await db.collection('bookings').find(query);
  return NextResponse.json(bookings);
}
