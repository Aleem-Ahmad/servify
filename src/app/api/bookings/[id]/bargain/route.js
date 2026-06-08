import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";

// GET - Fetch all bargain offers for a booking
export async function GET(request, { params }) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    
    // Verify user has access to this booking
    const booking = await prisma.booking.findUnique({
      where: { id },
      select: { customerId: true, providerId: true }
    });

    if (!booking) {
      return NextResponse.json({ success: false, message: "Booking not found" }, { status: 404 });
    }

    if (booking.customerId !== userId && booking.providerId !== userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    // Fetch all bargain offers for this booking
    const offers = await prisma.bargainOffer.findMany({
      where: { bookingId: id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, offers });
  } catch (error) {
    console.error("Error fetching bargain offers:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// POST - Create a new bargain offer
export async function POST(request, { params }) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const { proposedPrice, message, proposerType } = await request.json();

    if (!proposedPrice || proposedPrice <= 0) {
      return NextResponse.json({ success: false, message: "Invalid price" }, { status: 400 });
    }

    if (!proposerType || (proposerType !== 'customer' && proposerType !== 'provider')) {
      return NextResponse.json({ success: false, message: "Invalid proposer type" }, { status: 400 });
    }

    // Verify user has access to this booking
    const booking = await prisma.booking.findUnique({
      where: { id },
      select: { customerId: true, providerId: true, status: true, bargainingStatus: true }
    });

    if (!booking) {
      return NextResponse.json({ success: false, message: "Booking not found" }, { status: 404 });
    }

    // Verify the proposer matches the user role
    if (proposerType === 'customer' && booking.customerId !== userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    if (proposerType === 'provider' && booking.providerId !== userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    // Check if booking can be bargained (not completed or cancelled)
    if (booking.status === 'Completed' || booking.status === 'Cancelled') {
      return NextResponse.json({ success: false, message: "Cannot bargain on completed or cancelled bookings" }, { status: 400 });
    }

    // Update booking bargaining status
    await prisma.booking.update({
      where: { id },
      data: { bargainingStatus: 'Negotiating' }
    });

    // Create the bargain offer
    const offer = await prisma.bargainOffer.create({
      data: {
        bookingId: id,
        proposerId: userId,
        proposerType,
        proposedPrice,
        message: message || ''
      }
    });

    return NextResponse.json({ success: true, offer });
  } catch (error) {
    console.error("Error creating bargain offer:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// PUT - Accept or reject a bargain offer
export async function PUT(request, { params }) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const { offerId, action } = await request.json();

    if (!offerId || !action || (action !== 'accept' && action !== 'reject')) {
      return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });
    }

    // Verify user has access to this booking
    const booking = await prisma.booking.findUnique({
      where: { id },
      select: { customerId: true, providerId: true, status: true }
    });

    if (!booking) {
      return NextResponse.json({ success: false, message: "Booking not found" }, { status: 404 });
    }

    // Get the offer
    const offer = await prisma.bargainOffer.findUnique({
      where: { id: offerId },
      include: { booking: true }
    });

    if (!offer || offer.bookingId !== id) {
      return NextResponse.json({ success: false, message: "Offer not found" }, { status: 404 });
    }

    // Verify the responder is the opposite party
    if (offer.proposerType === 'customer' && booking.customerId === userId) {
      return NextResponse.json({ success: false, message: "Cannot accept your own offer" }, { status: 400 });
    }

    if (offer.proposerType === 'provider' && booking.providerId === userId) {
      return NextResponse.json({ success: false, message: "Cannot accept your own offer" }, { status: 400 });
    }

    if (offer.proposerType === 'customer' && booking.providerId !== userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    if (offer.proposerType === 'provider' && booking.customerId !== userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    if (action === 'accept') {
      // Update offer status
      await prisma.bargainOffer.update({
        where: { id: offerId },
        data: { status: 'Accepted' }
      });

      // Update booking with agreed price
      await prisma.booking.update({
        where: { id },
        data: {
          bargainingStatus: 'Agreed',
          agreedPrice: offer.proposedPrice,
          finalPrice: offer.proposedPrice
        }
      });

      // Reject all other pending offers
      await prisma.bargainOffer.updateMany({
        where: {
          bookingId: id,
          id: { not: offerId },
          status: 'Pending'
        },
        data: { status: 'Rejected' }
      });

      return NextResponse.json({ success: true, message: "Offer accepted", agreedPrice: offer.proposedPrice });
    } else {
      // Reject the offer
      await prisma.bargainOffer.update({
        where: { id: offerId },
        data: { status: 'Rejected' }
      });

      return NextResponse.json({ success: true, message: "Offer rejected" });
    }
  } catch (error) {
    console.error("Error updating bargain offer:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
