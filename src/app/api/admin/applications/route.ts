import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/adminAuth";
import { readApplications } from "@/lib/storage";

export async function GET(request: NextRequest) {
  const unauthorized = requireAuth(request);
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const applications = await readApplications();

    // Sort by most recent first
    applications.sort((a, b) => {
      return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
    });

    return NextResponse.json({ applications });
  } catch (error) {
    console.error("Failed to read applications:", error);
    return NextResponse.json(
      { error: "Failed to load applications" },
      { status: 500 }
    );
  }
}
