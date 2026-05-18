import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import mongoose from 'mongoose';

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const search = searchParams.get('search')?.toLowerCase() || '';
    const category = searchParams.get('category')?.toLowerCase() || '';

    // Single provider by ID
    if (id) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json({ error: "Invalid provider ID" }, { status: 400 });
      }
      const p = await User.findById(id);
      if (!p || p.role !== 'provider') {
        return NextResponse.json({ error: "Provider not found" }, { status: 404 });
      }
      return NextResponse.json({
        id: p._id.toString(),
        name: p.name,
        email: p.email,
        image: p.image || null,
        phone: p.phone || null,
        district: p.district || null,
        tehseel: p.tehseel || null,
        address: p.address || null,
        rating: p.performance?.rating || 0,
        rate: p.rate || 500,
        category: p.category || 'Professional',
        trustScore: p.trustScore || 0,
        badge: p.badge || 'Basic',
        experience: p.experience || null,
        services: p.services || null,
        status: p.status,
        isOnline: p.isOnline || false,
      });
    }

    let query = { role: 'provider', status: 'Active' };

    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }

    const providers = await User.find(query).sort({ trustScore: -1 });

    const formattedProviders = providers.map(p => ({
      id: p._id.toString(),
      name: p.name,
      email: p.email,
      image: p.image || `https://i.pravatar.cc/150?u=${p.email}`,
      rating: p.performance?.rating || 0,
      rate: p.rate || 500,
      category: p.category || 'Professional',
      trustScore: p.trustScore || 0,
      badge: p.badge || 'Basic',
      experience: p.experience || '',
      phone: p.phone || null,
      district: p.district || null,
    }));

    let filtered = formattedProviders;
    if (search) {
      filtered = formattedProviders.filter(p =>
        p.name.toLowerCase().includes(search) ||
        p.category.toLowerCase().includes(search)
      );
    }

    return NextResponse.json(filtered);

  } catch (error) {
    console.error("Fetch providers error:", error);
    return NextResponse.json({ error: "Failed to fetch providers" }, { status: 500 });
  }
}
