import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { sanitizeInput, sanitizeRequestBody } from './security';

// Rate limiting store (in-memory for development)
const rateLimitStore = new Map();

// Rate limiting function
export function checkRateLimit(identifier, limit = 100, windowMs = 60000) {
  const now = Date.now();
  const windowStart = now - windowMs;
  
  // Clean up old entries
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.timestamp < windowStart) {
      rateLimitStore.delete(key);
    }
  }
  
  const record = rateLimitStore.get(identifier) || { count: 0, timestamp: now };
  
  if (record.timestamp < windowStart) {
    record.count = 0;
    record.timestamp = now;
  }
  
  record.count++;
  rateLimitStore.set(identifier, record);
  
  return {
    allowed: record.count <= limit,
    remaining: limit - record.count,
    resetTime: record.timestamp + windowMs
  };
}

// Get client identifier for rate limiting
export function getClientIdentifier(request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
             request.headers.get('x-real-ip') || 
             'unknown';
  
  const userId = request.headers.get('x-user-id');
  
  return userId ? `user:${userId}` : `ip:${ip}`;
}

// Authentication check for API routes
export async function authenticateRequest(request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;
    
    if (!userId) {
      return {
        authenticated: false,
        user: null,
        error: 'Not authenticated'
      };
    }
    
    return {
      authenticated: true,
      user: { id: userId },
      error: null
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return {
      authenticated: false,
      user: null,
      error: 'Authentication failed'
    };
  }
}

// Role-based authorization check
export function authorizeRole(user, allowedRoles) {
  if (!user || !user.role) {
    return false;
  }
  
  return allowedRoles.includes(user.role);
}

// API route protection wrapper
export function protectApiRoute(handler, options = {}) {
  const {
    requireAuth = true,
    allowedRoles = [],
    rateLimit = 100,
    rateLimitWindow = 60000,
    sanitizeInput: shouldSanitize = true
  } = options;
  
  return async (request, context) => {
    try {
      // Rate limiting
      const identifier = getClientIdentifier(request);
      const rateLimitCheck = checkRateLimit(identifier, rateLimit, rateLimitWindow);
      
      if (!rateLimitCheck.allowed) {
        return NextResponse.json(
          { error: 'Too many requests' },
          { 
            status: 429, 
            headers: {
              'Retry-After': Math.ceil((rateLimitCheck.resetTime - Date.now()) / 1000).toString(),
              'X-RateLimit-Limit': rateLimit.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': rateLimitCheck.resetTime.toString()
            }
          }
        );
      }
      
      // Authentication check
      if (requireAuth) {
        const auth = await authenticateRequest(request);
        
        if (!auth.authenticated) {
          return NextResponse.json(
            { error: auth.error || 'Authentication required' },
            { status: 401 }
          );
        }
        
        // Role-based authorization
        if (allowedRoles.length > 0) {
          if (!authorizeRole(auth.user, allowedRoles)) {
            return NextResponse.json(
              { error: 'Insufficient permissions' },
              { status: 403 }
            );
          }
        }
        
        // Add user to request context
        request.user = auth.user;
      }
      
      // Input sanitization for POST/PUT/PATCH
      if (shouldSanitize && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
        try {
          const body = await request.json();
          const sanitizedBody = sanitizeRequestBody(body);
          
          // Create a new request with sanitized body
          const newRequest = new Request(request.url, {
            method: request.method,
            headers: request.headers,
            body: JSON.stringify(sanitizedBody)
          });
          
          // Call handler with sanitized request
          const response = await handler(newRequest, context);
          
          // Add rate limit headers
          response.headers.set('X-RateLimit-Limit', rateLimit.toString());
          response.headers.set('X-RateLimit-Remaining', rateLimitCheck.remaining.toString());
          response.headers.set('X-RateLimit-Reset', rateLimitCheck.resetTime.toString());
          
          return response;
        } catch (error) {
          // If JSON parsing fails, proceed with original request
          console.error('Sanitization error:', error);
        }
      }
      
      // Call handler
      const response = await handler(request, context);
      
      // Add rate limit headers
      response.headers.set('X-RateLimit-Limit', rateLimit.toString());
      response.headers.set('X-RateLimit-Remaining', rateLimitCheck.remaining.toString());
      response.headers.set('X-RateLimit-Reset', rateLimitCheck.resetTime.toString());
      
      return response;
      
    } catch (error) {
      console.error('API protection error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

// Error response helper
export function apiError(message, status = 400, details = null) {
  const response = {
    success: false,
    error: message
  };
  
  if (details) {
    response.details = details;
  }
  
  return NextResponse.json(response, { status });
}

// Success response helper
export function apiSuccess(data, message = 'Success') {
  return NextResponse.json({
    success: true,
    message,
    data
  });
}

// Validate request body against schema
export async function validateRequestBody(request, schema) {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);
    
    if (!result.success) {
      return {
        valid: false,
        errors: result.error.errors,
        data: null
      };
    }
    
    return {
      valid: true,
      errors: null,
      data: result.data
    };
  } catch (error) {
    return {
      valid: false,
      errors: [{ message: 'Invalid JSON format' }],
      data: null
    };
  }
}

// CORS headers helper
export function addCorsHeaders(response, origin = '*') {
  response.headers.set('Access-Control-Allow-Origin', origin);
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  response.headers.set('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
  
  return response;
}

// Security headers helper
export function addSecurityHeaders(response) {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  return response;
}

// Log security events
export function logSecurityEvent(event, details = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    ...details
  };
  
  console.log('[SECURITY]', JSON.stringify(logEntry));
  
  // In production, send to security monitoring service
  // e.g., Sentry, Datadog, or custom logging service
}

// Suspicious activity detection
export function detectSuspiciousActivity(request) {
  const suspiciousPatterns = [
    /\.\./, // Path traversal
    /<script>/i, // XSS attempt
    /javascript:/i, // JavaScript injection
    /union.*select/i, // SQL injection
    /drop.*table/i, // SQL injection
    /eval\(/i, // Code execution
    /exec\(/i, // Command execution
  ];
  
  const url = request.url.toLowerCase();
  const userAgent = request.headers.get('user-agent') || '';
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(url) || pattern.test(userAgent)) {
      logSecurityEvent('SUSPICIOUS_ACTIVITY_DETECTED', {
        url,
        userAgent,
        pattern: pattern.toString()
      });
      
      return true;
    }
  }
  
  return false;
}

// IP whitelist/blacklist check
export function checkIPAccess(ip, whitelist = [], blacklist = []) {
  if (blacklist.length > 0 && blacklist.includes(ip)) {
    return { allowed: false, reason: 'IP blacklisted' };
  }
  
  if (whitelist.length > 0 && !whitelist.includes(ip)) {
    return { allowed: false, reason: 'IP not whitelisted' };
  }
  
  return { allowed: true, reason: null };
}

// Request size limit check
export function checkRequestSize(request, maxSize = 10 * 1024 * 1024) {
  const contentLength = request.headers.get('content-length');
  
  if (contentLength && parseInt(contentLength) > maxSize) {
    return {
      allowed: false,
      reason: 'Request too large',
      maxSize: maxSize,
      actualSize: parseInt(contentLength)
    };
  }
  
  return { allowed: true, reason: null };
}
