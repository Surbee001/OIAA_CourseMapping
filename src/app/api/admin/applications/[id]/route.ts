import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/adminAuth";
import { promises as fs } from "fs";
import path from "path";
import { z } from "zod";
import { Application, ApplicationUpdate } from "@/types/application";

const storageFile = path.join(process.cwd(), "data", "applications-log.json");

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

async function readApplications(): Promise<Application[]> {
  try {
    const contents = await fs.readFile(storageFile, "utf8");
    return JSON.parse(contents) as Application[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

async function writeApplications(applications: Application[]): Promise<void> {
  const storageDir = path.dirname(storageFile);
  await fs.mkdir(storageDir, { recursive: true });
  await fs.writeFile(storageFile, JSON.stringify(applications, null, 2), "utf8");
}

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

    const applications = await readApplications();
    const applicationIndex = applications.findIndex((app) => app.id === id);

    if (applicationIndex === -1) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    const update: ApplicationUpdate = parsed.data;
    const oldStatus = applications[applicationIndex].status;
    
    applications[applicationIndex] = {
      ...applications[applicationIndex],
      ...update,
      updatedAt: new Date().toISOString(),
    };

    await writeApplications(applications);

    // Send nomination approved email if status changed to nominated or approved
    const newStatus = applications[applicationIndex].status;
    if (
      (newStatus === "nominated" || newStatus === "approved") &&
      oldStatus !== newStatus
    ) {
      try {
        const { sendNominationApprovedEmail } = await import("@/lib/resendClient");
        const emailResult = await sendNominationApprovedEmail(applications[applicationIndex]);
        
        if (!emailResult.success) {
          console.error("Nomination email failed:", emailResult.error);
        } else {
          console.info("[Nomination Approved] Email sent to:", applications[applicationIndex].studentEmail);
        }
      } catch (emailError) {
        console.error("Email system error:", emailError);
      }
    }

    return NextResponse.json({
      success: true,
      application: applications[applicationIndex],
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
    const applications = await readApplications();
    const filteredApplications = applications.filter((app) => app.id !== id);

    if (filteredApplications.length === applications.length) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    await writeApplications(filteredApplications);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete application:", error);
    return NextResponse.json(
      { error: "Failed to delete application" },
      { status: 500 }
    );
  }
}
