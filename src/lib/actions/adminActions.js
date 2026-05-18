"use server";

import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Booking from "@/models/Booking";
import { revalidatePath } from "next/cache";

export async function getAdminStats() {
  try {
    await connectDB();
    const totalUsers = await User.countDocuments();
    const totalProviders = await User.countDocuments({ role: "provider" });
    const pendingProviders = await User.countDocuments({ role: "provider", status: "Pending" });
    const totalBookings = await Booking.countDocuments();
    const completedBookings = await Booking.countDocuments({ status: "Completed" });

    return {
      success: true,
      stats: {
        totalUsers,
        totalProviders,
        pendingProviders,
        totalBookings,
        completedBookings,
      }
    };
  } catch (error) {
    console.error("Get Admin Stats Error:", error);
    return { success: false, message: error.message };
  }
}

export async function verifyProvider(providerId, status) {
  try {
    await connectDB();
    const user = await User.findByIdAndUpdate(providerId, { status }, { new: true });
    if (!user) return { success: false, message: "User not found" };
    
    revalidatePath("/adminDashboard");
    return { success: true, user: JSON.parse(JSON.stringify(user)) };
  } catch (error) {
    console.error("Verify Provider Error:", error);
    return { success: false, message: error.message };
  }
}

export async function getAllUsers() {
  try {
    await connectDB();
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    return { success: true, users: JSON.parse(JSON.stringify(users)) };
  } catch (error) {
    console.error("Get All Users Error:", error);
    return { success: false, message: error.message };
  }
}
