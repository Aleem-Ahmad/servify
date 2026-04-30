import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search')?.toLowerCase() || '';
  const category = searchParams.get('category')?.toLowerCase() || '';
  const location = searchParams.get('location')?.toLowerCase() || '';

  const providers = await db.collection('users').find({ role: 'provider' });
  
  // Transform to match components expected format
  let formattedProviders = providers.map(p => ({
    id: p.id,
    name: p.name,
    image: `https://i.pravatar.cc/150?u=${p.email}`,
    rating: p.rating || 0,
    rate: p.rate || 500,
    category: p.category || 'Professional',
    city: p.city || '',
    experience: p.experience || '',
    phone: p.phone || '',
  }));

  if (search) {
    formattedProviders = formattedProviders.filter(p => p.name.toLowerCase().includes(search) || p.category.toLowerCase().includes(search));
  }
  if (category) {
    formattedProviders = formattedProviders.filter(p => p.category.toLowerCase().includes(category));
  }
  if (location) {
    formattedProviders = formattedProviders.filter(p => p.city.toLowerCase().includes(location));
  }

  return NextResponse.json(formattedProviders);
}

