import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/adminAuth";
import { generateApplicationPDF } from "@/lib/pdfGenerator";
import { findApplication } from "@/lib/storage";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = requireAuth(request);
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const { id } = await params;
    const application = await findApplication(id);

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    const pdfBuffer = generateApplicationPDF(application);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="application-${application.id}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Failed to generate PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}

