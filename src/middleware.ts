import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rate limiting store (in-memory, per instance)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limit configuration
const RATE_LIMITS = {
  login: { maxRequests: 5, windowMs: 15 * 60 * 1000 }, // 5 requests per 15 minutes
  application: { maxRequests: 10, windowMs: 60 * 60 * 1000 }, // 10 per hour
  draft: { maxRequests: 30, windowMs: 60 * 60 * 1000 }, // 30 per hour
};

function getRateLimitKey(ip: string, endpoint: string): string {
  return `${ip}:${endpoint}`;
}

function checkRateLimit(
  ip: string,
  endpoint: string,
  config: { maxRequests: number; windowMs: number }
): { allowed: boolean; remaining: number; resetTime: number } {
  const key = getRateLimitKey(ip, endpoint);
  const now = Date.now();
  const limit = rateLimitStore.get(key);

  if (!limit || now > limit.resetTime) {
    // Reset or create new limit
    const resetTime = now + config.windowMs;
    rateLimitStore.set(key, { count: 1, resetTime });
    return { allowed: true, remaining: config.maxRequests - 1, resetTime };
  }

  if (limit.count >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetTime: limit.resetTime };
  }

  limit.count++;
  return {
    allowed: true,
    remaining: config.maxRequests - limit.count,
    resetTime: limit.resetTime,
  };
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60 * 60 * 1000); // Clean up every hour

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Add security headers for XSS protection
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // unsafe-inline needed for Next.js
      "style-src 'self' 'unsafe-inline'", // unsafe-inline needed for styled components
      "img-src 'self' data: https: blob:",
      "font-src 'self' data:",
      "connect-src 'self' https://calendly.com https://api.calendly.com",
      "frame-src https://calendly.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join("; ")
  );

  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  // Apply rate limiting
  const ip = request.ip || request.headers.get("x-forwarded-for") || "unknown";
  const pathname = request.nextUrl.pathname;

  // Rate limit login endpoint
  if (pathname === "/api/auth/login" && request.method === "POST") {
    const result = checkRateLimit(ip, "login", RATE_LIMITS.login);

    response.headers.set("X-RateLimit-Limit", RATE_LIMITS.login.maxRequests.toString());
    response.headers.set("X-RateLimit-Remaining", result.remaining.toString());
    response.headers.set(
      "X-RateLimit-Reset",
      new Date(result.resetTime).toISOString()
    );

    if (!result.allowed) {
      return NextResponse.json(
        {
          error: "Too many login attempts. Please try again later.",
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
        },
        { status: 429 }
      );
    }
  }

  // Rate limit application submission
  if (pathname === "/api/applications" && request.method === "POST") {
    const result = checkRateLimit(ip, "application", RATE_LIMITS.application);

    response.headers.set(
      "X-RateLimit-Limit",
      RATE_LIMITS.application.maxRequests.toString()
    );
    response.headers.set("X-RateLimit-Remaining", result.remaining.toString());
    response.headers.set(
      "X-RateLimit-Reset",
      new Date(result.resetTime).toISOString()
    );

    if (!result.allowed) {
      return NextResponse.json(
        {
          error: "Too many application submissions. Please try again later.",
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
        },
        { status: 429 }
      );
    }
  }

  // Rate limit draft saves
  if (pathname === "/api/applications/draft" && request.method === "POST") {
    const result = checkRateLimit(ip, "draft", RATE_LIMITS.draft);

    if (!result.allowed) {
      return NextResponse.json(
        {
          error: "Too many requests. Please slow down.",
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
        },
        { status: 429 }
      );
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/api/:path*",
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

