import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Fetch top providers
    // Since performance is a JSON field, sorting natively can be tricky, 
    // so we fetch all providers and sort in memory (or use a raw query if necessary)
    const providers = await prisma.user.findMany({
      where: { role: 'provider' }
    });
    
    // Sort by leaderboardPoints descending
    providers.sort((a, b) => {
      const ptsA = a.performance?.leaderboardPoints || 0;
      const ptsB = b.performance?.leaderboardPoints || 0;
      return ptsB - ptsA;
    });
    
    const topProviders = providers.slice(0, 10);

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
