import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const search = searchParams.get('search')?.toLowerCase() || '';
    const category = searchParams.get('category')?.toLowerCase() || '';

    // Single provider by ID
    if (id) {
      const p = await prisma.user.findUnique({ 
        where: { id },
        include: { offers: true }
      });
      if (!p || p.role !== 'provider') {
        return NextResponse.json({ error: "Provider not found" }, { status: 404 });
      }
      return NextResponse.json({
        id: p.id,
        name: p.name,
        email: p.email,
        image: p.image || (p.documents?.profile) || null,
        phone: p.phone || null,
        district: p.district || null,
        tehseel: p.tehseel || null,
        address: p.address || null,
        rating: p.performance?.rating || 0,
        rate: p.hourlyRate || 0,
        category: p.category || 'Professional',
        trustScore: p.trustScore || 0,
        badge: p.badge || 'Basic',
        experience: p.experience || null,
        services: p.services || null,
        status: p.status,
        isOnline: p.isOnline || false,
        offers: p.offers || [],
      });
    }

    let query = { role: 'provider', status: { in: ['Active', 'verified'] } };

    if (category) {
      query.category = { contains: category, mode: 'insensitive' };
    }

    const providers = await prisma.user.findMany({
      where: query,
      orderBy: { trustScore: 'desc' },
      include: { offers: true }
    });

    const formattedProviders = providers.map(p => ({
      id: p.id,
      name: p.name,
      email: p.email,
      image: p.image || (p.documents?.profile) || null,
      rating: p.performance?.rating || 0,
      rate: p.hourlyRate || 0,
      category: p.category || 'Professional',
      trustScore: p.trustScore || 0,
      badge: p.badge || 'Basic',
      experience: p.experience || '',
      phone: p.phone || null,
      district: p.district || null,
      offers: p.offers || [],
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
