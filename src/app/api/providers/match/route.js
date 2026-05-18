import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(request) {
  await connectDB();
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
      category: category,
    };

    // Filter by online status if urgent
    if (urgency === 'Urgent' || urgency === 'Emergency') {
      query.isOnline = true;
    }

    // Geo-spatial search (within 10km)
    let providers;
    if (lat && lng) {
      providers = await User.find({
        ...query,
        location: {
          $near: {
            $geometry: { type: "Point", coordinates: [lng, lat] },
            $maxDistance: 10000 // 10km
          }
        }
      }).limit(10);
    } else {
      providers = await User.find(query).sort({ trustScore: -1 }).limit(10);
    }

    // Sort by trust score for "Best Suggestion"
    const sortedProviders = providers.sort((a, b) => b.trustScore - a.trustScore);

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
