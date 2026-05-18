"use server";

import connectDB from "@/lib/mongodb";
import Booking from "@/models/Booking";
import User from "@/models/User";
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
    await connectDB();
    const newBooking = new Booking({
      customer: formData.customerId,
      provider: formData.providerId,
      service: formData.service,
      details: formData.details,
      budget: formData.budget,
      urgency: formData.urgency || "Normal",
      status: "Pending",
    });
    await newBooking.save();
    revalidatePath("/customerDashboard");
    return { success: true, booking: JSON.parse(JSON.stringify(newBooking)) };
  } catch (error) {
    console.error("Create Booking Error:", error);
    return { success: false, message: error.message };
  }
}

export async function updateBookingStatus(bookingId, status) {
  try {
    await connectDB();
    const booking = await Booking.findByIdAndUpdate(bookingId, { status }, { new: true });
    if (!booking) return { success: false, message: "Booking not found" };
    
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
    await connectDB();
    const bookings = await Booking.find({ provider: providerId }).populate("customer", "name email phone image").sort({ createdAt: -1 });
    return { success: true, bookings: JSON.parse(JSON.stringify(bookings)) };
  } catch (error) {
    console.error("Get Provider Bookings Error:", error);
    return { success: false, message: error.message };
  }
}

export async function getCustomerBookings(customerId) {
  try {
    await connectDB();
    const bookings = await Booking.find({ customer: customerId }).populate("provider", "name email phone image category").sort({ createdAt: -1 });
    return { success: true, bookings: JSON.parse(JSON.stringify(bookings)) };
  } catch (error) {
    console.error("Get Customer Bookings Error:", error);
    return { success: false, message: error.message };
  }
}
