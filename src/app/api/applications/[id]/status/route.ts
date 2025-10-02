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

    return NextResponse.json({
      status: application.status,
      updatedAt: application.updatedAt,
    });
  } catch (error) {
    console.error("Failed to get application status:", error);
    return NextResponse.json(
      { error: "Failed to get application status" },
      { status: 500 }
    );
  }
}
