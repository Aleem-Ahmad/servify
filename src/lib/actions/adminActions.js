"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getAdminStats() {
  try {
    const totalUsers = await prisma.user.count();
    const totalProviders = await prisma.user.count({ where: { role: "provider" } });
    const pendingProviders = await prisma.user.count({ where: { role: "provider", status: "Pending" } });
    const totalBookings = await prisma.booking.count();
    const completedBookings = await prisma.booking.count({ where: { status: "Completed" } });

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
    const user = await prisma.user.update({
      where: { id: providerId },
      data: { status }
    });
    
    revalidatePath("/adminDashboard");
    return { success: true, user: JSON.parse(JSON.stringify(user)) };
  } catch (error) {
    console.error("Verify Provider Error:", error);
    return { success: false, message: error.message };
  }
}

export async function getAllUsers() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    // Remove passwords before returning
    const safeUsers = users.map(user => {
      const { password, ...safeUser } = user;
      return safeUser;
    });

    return { success: true, users: JSON.parse(JSON.stringify(safeUsers)) };
  } catch (error) {
    console.error("Get All Users Error:", error);
    return { success: false, message: error.message };
  }
}

export async function getAdminEarnings() {
  try {
    const completedBookings = await prisma.booking.findMany({
      where: { status: "Completed" },
      orderBy: { createdAt: "desc" }
    });

    const totalProcessed = completedBookings.reduce((sum, b) => sum + (b.budget || 0), 0);
    // Platform cut is 10% of budget + any convenience fees in payment json
    const platformCut = completedBookings.reduce((sum, b) => {
      let cut = (b.budget || 0) * 0.10;
      if (b.payment && typeof b.payment === 'object') {
        const fee = parseFloat(b.payment.convenienceFee);
        if (!isNaN(fee)) cut += fee;
      }
      return sum + cut;
    }, 0);

    return {
      success: true,
      earnings: {
        totalProcessed,
        platformCut,
        bookingsCount: completedBookings.length,
        bookings: JSON.parse(JSON.stringify(completedBookings)),
      }
    };
  } catch (error) {
    console.error("Get Admin Earnings Error:", error);
    return { success: false, message: error.message };
  }
}
