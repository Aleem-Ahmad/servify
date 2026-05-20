"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * @param {Object} formData 
 * @param {string} formData.customerId
 * @param {string} formData.providerId
 * @param {string} formData.service
 * @param {string} formData.details
 * @param {number} formData.budget
 * @param {"Normal" | "Urgent" | "Emergency"} [formData.urgency]
 */
export async function createBooking(formData) {
  try {
    const newBooking = await prisma.booking.create({
      data: {
        customerId: formData.customerId,
        providerId: formData.providerId,
        service: formData.service,
        details: formData.details,
        budget: formData.budget,
        urgency: formData.urgency || "Normal",
        status: "Pending",
      }
    });
    revalidatePath("/customerDashboard");
    return { success: true, booking: JSON.parse(JSON.stringify(newBooking)) };
  } catch (error) {
    console.error("Create Booking Error:", error);
    return { success: false, message: error.message };
  }
}

export async function updateBookingStatus(bookingId, status) {
  try {
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status }
    });
    
    revalidatePath("/customerDashboard");
    revalidatePath("/providerDashboard");
    return { success: true, booking: JSON.parse(JSON.stringify(booking)) };
  } catch (error) {
    console.error("Update Booking Status Error:", error);
    return { success: false, message: error.message };
  }
}

export async function getProviderBookings(providerId) {
  try {
    const bookings = await prisma.booking.findMany({
      where: { providerId: providerId },
      include: {
        customer: {
          select: { name: true, email: true, phone: true, image: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return { success: true, bookings: JSON.parse(JSON.stringify(bookings)) };
  } catch (error) {
    console.error("Get Provider Bookings Error:", error);
    return { success: false, message: error.message };
  }
}

export async function getCustomerBookings(customerId) {
  try {
    const bookings = await prisma.booking.findMany({
      where: { customerId: customerId },
      include: {
        provider: {
          select: { name: true, email: true, phone: true, image: true, category: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return { success: true, bookings: JSON.parse(JSON.stringify(bookings)) };
  } catch (error) {
    console.error("Get Customer Bookings Error:", error);
    return { success: false, message: error.message };
  }
}
