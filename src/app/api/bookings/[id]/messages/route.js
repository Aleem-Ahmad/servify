import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request, { params }) {
  try {
    const { id } = await params;
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }

    const booking = await getAuthorizedBooking(id, userId);
    if (!booking) {
      return NextResponse.json({ success: false, message: "Chat is not available for this booking" }, { status: 403 });
    }
    if (!booking.providerId) {
      return NextResponse.json({ success: false, message: "Chat starts after a provider accepts the booking" }, { status: 403 });
    }

    await prisma.chatMessage.updateMany({
      where: {
        bookingId: id,
        senderId: { not: userId },
        readAt: null,
      },
      data: { readAt: new Date() },
    });

    const messages = await prisma.chatMessage.findMany({
      where: { bookingId: id },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            role: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
      take: 100,
    });

    return NextResponse.json({
      success: true,
      messages: messages.map((message) => ({
        id: message.id,
        bookingId: message.bookingId,
        senderId: message.senderId,
        body: message.body,
        createdAt: message.createdAt,
        readAt: message.readAt,
        sender: message.sender,
        mine: message.senderId === userId,
      })),
    });
  } catch (error) {
    console.error("GET booking messages error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }

    const booking = await getAuthorizedBooking(id, userId);
    if (!booking || !booking.providerId) {
      return NextResponse.json({ success: false, message: "Chat starts after a provider accepts the booking" }, { status: 403 });
    }

    const body = await request.json();
    const text = String(body.message || "").trim();
    if (!text) {
      return NextResponse.json({ success: false, message: "Message cannot be empty" }, { status: 400 });
    }
    if (text.length > 1000) {
      return NextResponse.json({ success: false, message: "Message is too long" }, { status: 400 });
    }

    const message = await prisma.chatMessage.create({
      data: {
        bookingId: id,
        senderId: userId,
        body: text,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            role: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: {
        id: message.id,
        bookingId: message.bookingId,
        senderId: message.senderId,
        body: message.body,
        createdAt: message.createdAt,
        readAt: message.readAt,
        sender: message.sender,
        mine: true,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("POST booking message error:", error);
    return NextResponse.json({ success: false, message: "Failed to send message" }, { status: 500 });
  }
}

async function getCurrentUserId() {
  const cookieStore = await cookies();
  return cookieStore.get("userId")?.value || null;
}

async function getAuthorizedBooking(bookingId, userId) {
  return prisma.booking.findFirst({
    where: {
      id: bookingId,
      OR: [
        { customerId: userId },
        { providerId: userId },
      ],
    },
    select: {
      id: true,
      customerId: true,
      providerId: true,
      status: true,
    },
  });
}
