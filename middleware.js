import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Rate limiting store (in-memory for development, use Redis for production)
const rateLimit = new Map();

// Security headers configuration
const securityHeaders = {
  'X-DNS-Prefetch-Control': 'force-dns-prefetch',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'X-XSS-Protection': '1; mode=block',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://*.cloudinary.com; frame-src 'self';"
};

// Rate limiting function
function checkRateLimit(ip, limit = 100, window = 60000) {
  const now = Date.now();
  const windowStart = now - window;
  
  // Clean up old entries
  for (const [key, value] of rateLimit.entries()) {
    if (value.timestamp < windowStart) {
      rateLimit.delete(key);
    }
  }
  
  const record = rateLimit.get(ip) || { count: 0, timestamp: now };
  
  if (record.timestamp < windowStart) {
    record.count = 0;
    record.timestamp = now;
  }
  
  record.count++;
  rateLimit.set(ip, record);
  
  return record.count <= limit;
}

// Paths that require authentication
const protectedPaths = [
  '/providerDashboard',
  '/customerDashboard',
  '/adminDashboard',
  '/api/user/profile',
  '/api/provider/settings',
  '/api/bookings',
  '/api/feedback'
];

// Paths that are always public
const publicPaths = [
  '/',
  '/authentication',
  '/auth',
  '/api/auth',
  '/forgot-password',
  '/coming-soon',
  '/plans',
  '/login-first'
];

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  
  // Apply rate limiting to all requests
  if (!checkRateLimit(ip, 100, 60000)) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }
  
  // Apply security headers to all responses
  const response = NextResponse.next();
  
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  // CORS headers for API routes
  if (pathname.startsWith('/api')) {
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_APP_URL || '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    response.headers.set(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 204, headers: response.headers });
    }
  }
  
  // Authentication check for protected paths
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
  
  if (isProtectedPath && !isPublicPath) {
    try {
      const cookieStore = await cookies();
      const userId = cookieStore.get('userId')?.value;
      
      if (!userId) {
        // Redirect to authentication page for protected routes
        const redirectUrl = new URL('/authentication', request.url);
        redirectUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(redirectUrl);
      }
      
      // Add user info to headers for API routes
      if (pathname.startsWith('/api')) {
        response.headers.set('x-user-id', userId);
      }
      
      // Note: Role-based access control should be handled in API routes
      // since we don't have full user metadata in cookies
      
    } catch (error) {
      console.error('Middleware authentication error:', error);
      // On error, redirect to auth page for safety
      return NextResponse.redirect(new URL('/authentication', request.url));
    }
  }
  
  // CSRF protection for state-changing requests
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method) && pathname.startsWith('/api')) {
    const csrfToken = request.headers.get('x-csrf-token');
    // In production, validate against session token
    // For now, we'll add a header that can be validated
    response.headers.set('x-csrf-token', 'generate-new-token');
  }
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
