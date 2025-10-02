import { NextRequest, NextResponse } from "next/server";
import { findApplication } from "@/lib/storage";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const application = await findApplication(id);

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ application });
  } catch (error) {
    console.error("Failed to fetch application:", error);
    return NextResponse.json(
      { error: "Failed to fetch application" },
      { status: 500 }
    );
  }
}

