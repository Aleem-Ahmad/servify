import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const { status } = await request.json();

    const result = await db.collection('bookings').update({ id }, { status });

    if (result.updatedCount === 0) {
      return NextResponse.json({ success: false, message: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Booking status updated to ${status}`
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Failed to update booking status"
    }, { status: 500 });
  }
}

export async function GET(request, { params }) {
  const { id } = params;
  const booking = await db.collection('bookings').findOne({ id });

  if (!booking) {
    return NextResponse.json({ message: "Booking not found" }, { status: 404 });
  }

  return NextResponse.json(booking);
}
