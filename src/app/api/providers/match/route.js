import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Helper function to calculate distance using Haversine formula
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI/180; // φ, λ in radians
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // in metres
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const budget = parseFloat(searchParams.get('budget')) || 5000;
    const urgency = searchParams.get('urgency') || 'Normal';
    const lat = parseFloat(searchParams.get('lat'));
    const lng = parseFloat(searchParams.get('lng'));

    let query = {
      role: 'provider',
      status: 'Active',
      category: category || undefined,
    };

    // Filter by online status if urgent
    if (urgency === 'Urgent' || urgency === 'Emergency') {
      query.isOnline = true;
    }

    let providers = await prisma.user.findMany({ where: query });

    // Geo-spatial search (within 10km) done in JS since location is JSON in Postgres
    if (lat && lng) {
      providers = providers.filter(p => {
        if (!p.location || !p.location.coordinates) return false;
        const [pLng, pLat] = p.location.coordinates;
        const dist = getDistance(lat, lng, pLat, pLng);
        return dist <= 10000; // 10km
      });
    }

    // Sort by trust score for "Best Suggestion"
    const sortedProviders = providers.sort((a, b) => b.trustScore - a.trustScore).slice(0, 10);

    return NextResponse.json({
      success: true,
      count: sortedProviders.length,
      providers: sortedProviders
    });

  } catch (error) {
    console.error("Smart Matching Error:", error);
    return NextResponse.json({ success: false, message: "Matching failed" }, { status: 500 });
  }
}
