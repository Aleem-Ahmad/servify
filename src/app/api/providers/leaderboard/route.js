import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  await connectDB();
  try {
    // Fetch top providers based on leaderboard points
    const topProviders = await User.find({ role: 'provider' })
      .sort({ "performance.leaderboardPoints": -1 })
      .limit(10);

    const formatted = topProviders.map((p, index) => ({
      rank: index + 1,
      name: p.name,
      points: p.performance?.leaderboardPoints || 0,
      badge: p.badge || 'Basic',
      image: p.image || `https://i.pravatar.cc/150?u=${p.email}`,
      category: p.category
    }));

    return NextResponse.json({ success: true, leaders: formatted });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Leaderboard error" }, { status: 500 });
  }
}
