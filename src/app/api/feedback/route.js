import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
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

    // Check if review already exists for this booking
    const existing = await prisma.review.findFirst({
      where: { bookingId }
    });
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

    await prisma.review.create({
      data: {
        bookingId,
        customerId,
        providerId,
        rating,
        comment,
        mediaUrls,
      }
    });

    // Update provider's trust score (average of all ratings * 20)
    const allReviews = await prisma.review.findMany({
      where: { providerId }
    });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    
    // Fetch provider to preserve other performance metrics
    const provider = await prisma.user.findUnique({ where: { id: providerId } });
    const performance = provider?.performance || {};
    
    await prisma.user.update({
      where: { id: providerId },
      data: {
        performance: {
          ...performance,
          rating: parseFloat(avgRating.toFixed(1))
        },
        trustScore: Math.round(avgRating * 20),
      }
    });

    return NextResponse.json({ success: true, message: 'Thank you for your feedback!' });
  } catch (error) {
    console.error('Feedback POST error:', error);
    return NextResponse.json({ success: false, message: 'Failed to submit feedback' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get('providerId');
    const bookingId = searchParams.get('bookingId');

    let query = {};
    if (providerId) {
      query.providerId = providerId;
    }
    if (bookingId) {
      query.bookingId = bookingId;
    }

    const reviews = await prisma.review.findMany({
      where: query,
      include: {
        customer: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Normalize to always include customerName
    const normalized = reviews.map(r => ({
      _id: r.id,
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
