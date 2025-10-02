import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/adminAuth";
import { z } from "zod";
import { AdminComment } from "@/types/application";
import { randomBytes } from "crypto";
import { findApplication, updateApplication } from "@/lib/storage";

const commentSchema = z.object({
  type: z.enum(["note", "document_request", "process_update"]),
  message: z.string().min(1),
  page: z.enum(["step_0", "step_1", "step_2", "step_3", "success_page"]),
});

function generateCommentId(): string {
  return randomBytes(6).toString("hex");
}

export async function POST(
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
    const parsed = commentSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid comment payload", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const application = await findApplication(id);

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Get admin email from session
    const sessionCookie = request.cookies.get("admin-session");
    let adminEmail = "admin@ajmanuni.ac.ae";
    if (sessionCookie) {
      try {
        const session = JSON.parse(sessionCookie.value);
        adminEmail = session.email || adminEmail;
      } catch {
        // Use default
      }
    }

    const newComment: AdminComment = {
      id: generateCommentId(),
      type: parsed.data.type,
      message: parsed.data.message,
      page: parsed.data.page,
      createdAt: new Date().toISOString(),
      createdBy: adminEmail,
    };

    const existingComments = application.adminComments || [];
    const updatedApp = await updateApplication(id, {
      adminComments: [...existingComments, newComment],
    });

    if (!updatedApp) {
      return NextResponse.json(
        { error: "Failed to update application" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      comment: newComment,
      application: updatedApp,
    });
  } catch (error) {
    console.error("Failed to add comment:", error);
    return NextResponse.json(
      { error: "Failed to add comment" },
      { status: 500 }
    );
  }
}

