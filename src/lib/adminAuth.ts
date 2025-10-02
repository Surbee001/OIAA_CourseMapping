import { NextRequest, NextResponse } from "next/server";

// Get credentials from environment variables with fallbacks for development
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "international@ajman.ac.ae";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "OI@a25";
const ADMIN_AUTH_COOKIE = "oiaa_admin_auth";
const ADMIN_AUTH_VALUE = "authenticated_oiaa_2025";

// Detect production environment
const isProduction = process.env.NODE_ENV === "production";

export async function validateAdminCredentials(
  email: string,
  password: string
): Promise<boolean> {
  return email === ADMIN_EMAIL && password === ADMIN_PASSWORD;
}

export function setAdminCookie(response: NextResponse) {
  response.cookies.set({
    name: ADMIN_AUTH_COOKIE,
    value: ADMIN_AUTH_VALUE,
    httpOnly: true,
    secure: isProduction, // Enable secure cookies in production (requires HTTPS)
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24 hours
    path: "/",
  });
}

export function clearAdminCookie(response: NextResponse) {
  response.cookies.set({
    name: ADMIN_AUTH_COOKIE,
    value: "",
    httpOnly: true,
    maxAge: 0,
    path: "/",
  });
}

export function isAuthenticated(request: NextRequest): boolean {
  const authCookie = request.cookies.get(ADMIN_AUTH_COOKIE)?.value;
  return authCookie === ADMIN_AUTH_VALUE;
}

export function requireAuth(request: NextRequest): NextResponse | null {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
