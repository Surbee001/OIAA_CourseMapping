import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/adminAuth";

const ADMIN_EMAIL = "international@ajman.ac.ae";

export async function GET(request: NextRequest) {
  const unauthorized = requireAuth(request);
  if (unauthorized) {
    return unauthorized;
  }

  return NextResponse.json({ 
    authenticated: true, 
    session: { email: ADMIN_EMAIL } 
  });
}
