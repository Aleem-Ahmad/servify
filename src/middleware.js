import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const url = request.nextUrl;

  // 1. If user is authenticated and tries to access auth pages, redirect to dashboard
  if (token && url.pathname.startsWith('/authentication')) {
    const role = token.role;
    if (role === 'admin') return NextResponse.redirect(new URL('/adminDashboard', request.url));
    if (role === 'provider') return NextResponse.redirect(new URL('/providerDashboard', request.url));
    return NextResponse.redirect(new URL('/customerDashboard', request.url));
  }

  // 2. Protect Dashboard Routes
  const protectedRoutes = ['/adminDashboard', '/providerDashboard', '/customerDashboard', '/profile'];
  const isProtectedRoute = protectedRoutes.some(path => url.pathname.startsWith(path));

  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL('/authentication', request.url));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/authentication',
    '/adminDashboard/:path*',
    '/providerDashboard/:path*',
    '/customerDashboard/:path*',
    '/profile/:path*',
  ],
};
