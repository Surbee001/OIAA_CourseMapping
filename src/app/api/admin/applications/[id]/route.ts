import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/adminAuth";
import { z } from "zod";
import { ApplicationUpdate } from "@/types/application";
import { updateApplication, deleteApplication, findApplication } from "@/lib/storage";

const updateSchema = z.object({
  status: z
    .enum([
      "draft",
      "submitted",
      "awaiting_nomination",
      "nominated",
      "session_booked",
      "session_completed",
      "approved",
      "rejected",
    ])
    .optional(),
  adminNotes: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = requireAuth(request);
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const { id } = await params;
    const json = await request.json().catch(() => null);
    const parsed = updateSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid update payload", details: parsed.error.format() },
        { status: 400 }
      );
    }

    // Get the existing application to check old status
    const existingApp = await findApplication(id);
    
    if (!existingApp) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    const update: ApplicationUpdate = parsed.data;
    const oldStatus = existingApp.status;
    
    // Update the application
    const updatedApp = await updateApplication(id, update);
    
    if (!updatedApp) {
      return NextResponse.json(
        { error: "Failed to update application" },
        { status: 500 }
      );
    }

    // Send nomination approved email in background (silent - never block the response)
    const newStatus = updatedApp.status;
    if (
      (newStatus === "nominated" || newStatus === "approved") &&
      oldStatus !== newStatus
    ) {
      setImmediate(async () => {
        try {
          const { sendNominationApprovedEmail } = await import("@/lib/resendClient");
          const emailResult = await sendNominationApprovedEmail(updatedApp);
          
          if (!emailResult.success) {
            console.log("[Email] Nomination email failed:", emailResult.error);
          } else {
            console.log("[Email] Nomination sent to:", updatedApp.studentEmail);
          }
        } catch (emailError) {
          console.log("[Email] Skipped due to error:", emailError instanceof Error ? emailError.message : String(emailError));
        }
      });
    }

    return NextResponse.json({
      success: true,
      application: updatedApp,
    });
  } catch (error) {
    console.error("Failed to update application:", error);
    return NextResponse.json(
      { error: "Failed to update application" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = requireAuth(request);
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const { id } = await params;
    const deleted = await deleteApplication(id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete application:", error);
    return NextResponse.json(
      { error: "Failed to delete application" },
      { status: 500 }
    );
  }
}
