import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/adminAuth";
import { promises as fs } from "fs";
import path from "path";
import { z } from "zod";
import { Application, AdminComment } from "@/types/application";
import { randomBytes } from "crypto";

const storageFile = path.join(process.cwd(), "data", "applications-log.json");

const commentSchema = z.object({
  type: z.enum(["note", "document_request", "process_update"]),
  message: z.string().min(1),
  page: z.enum(["step_0", "step_1", "step_2", "step_3", "success_page"]),
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

    const applications = await readApplications();
    const applicationIndex = applications.findIndex((app) => app.id === id);

    if (applicationIndex === -1) {
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

    const existingComments = applications[applicationIndex].adminComments || [];
    applications[applicationIndex].adminComments = [...existingComments, newComment];
    applications[applicationIndex].updatedAt = new Date().toISOString();

    await writeApplications(applications);

    return NextResponse.json({
      success: true,
      comment: newComment,
      application: applications[applicationIndex],
    });
  } catch (error) {
    console.error("Failed to add comment:", error);
    return NextResponse.json(
      { error: "Failed to add comment" },
      { status: 500 }
    );
  }
}

