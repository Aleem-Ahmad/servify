import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Review from '@/models/Review';
import Booking from '@/models/Booking';
import User from '@/models/User';
import mongoose from 'mongoose';

export async function POST(request) {
  await connectDB();
  try {
    const formData = await request.formData();
    const bookingId = formData.get('bookingId');
    const customerId = formData.get('customerId');
    const providerId = formData.get('providerId');
    const rating = parseInt(formData.get('rating'));
    const comment = formData.get('comment') || '';

    if (!bookingId || !customerId || !providerId || !rating) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(bookingId) || !mongoose.Types.ObjectId.isValid(customerId) || !mongoose.Types.ObjectId.isValid(providerId)) {
      return NextResponse.json({ success: false, message: 'Invalid IDs' }, { status: 400 });
    }

    // Check if review already exists for this booking
    const existing = await Review.findOne({ booking: bookingId });
    if (existing) {
      return NextResponse.json({ success: false, message: 'You have already reviewed this booking.' }, { status: 409 });
    }

    // Handle optional media files (store as base64 data URLs for now)
    const mediaUrls = [];
    const mediaFiles = ['photo', 'video', 'audio'];
    for (const field of mediaFiles) {
      const file = formData.get(field);
      if (file && file.size > 0) {
        const buffer = await file.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        const mimeType = file.type;
        mediaUrls.push(`data:${mimeType};base64,${base64}`);
      }
    }

    const review = new Review({
      booking: new mongoose.Types.ObjectId(bookingId),
      customer: new mongoose.Types.ObjectId(customerId),
      provider: new mongoose.Types.ObjectId(providerId),
      rating,
      comment,
      mediaUrls,
    });
    await review.save();

    // Update provider's trust score (average of all ratings * 20)
    const allReviews = await Review.find({ provider: new mongoose.Types.ObjectId(providerId) });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await User.findByIdAndUpdate(providerId, {
      'performance.rating': parseFloat(avgRating.toFixed(1)),
      trustScore: Math.round(avgRating * 20),
    });

    return NextResponse.json({ success: true, message: 'Thank you for your feedback!' });
  } catch (error) {
    console.error('Feedback POST error:', error);
    return NextResponse.json({ success: false, message: 'Failed to submit feedback' }, { status: 500 });
  }
}

export async function GET(request) {
  await connectDB();
  try {
    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get('providerId');
    const bookingId = searchParams.get('bookingId');

    let query = {};
    if (providerId && mongoose.Types.ObjectId.isValid(providerId)) {
      query.provider = new mongoose.Types.ObjectId(providerId);
    }
    if (bookingId && mongoose.Types.ObjectId.isValid(bookingId)) {
      query.booking = new mongoose.Types.ObjectId(bookingId);
    }

    const reviews = await Review.find(query)
      .populate('customer', 'name')
      .sort({ createdAt: -1 });

    // Normalize to always include customerName
    const normalized = reviews.map(r => ({
      _id: r._id,
      rating: r.rating,
      comment: r.comment,
      mediaUrls: r.mediaUrls || [],
      customerName: r.customer?.name || 'Anonymous',
      createdAt: r.createdAt,
    }));

    return NextResponse.json(normalized);
  } catch (error) {
    console.error('Feedback GET error:', error);
    return NextResponse.json({ message: 'Failed to fetch reviews' }, { status: 500 });
  }
}
