import { NextResponse } from "next/server";
import { z } from "zod";
import { promises as fs } from "fs";
import path from "path";
import { Application } from "@/types/application";
import { randomBytes } from "crypto";

const payloadSchema = z.object({
  studentName: z.string().min(1).max(100),
  studentId: z.string().min(1).max(50),
  studentEmail: z.string().email().max(100),
  studentNationality: z.string().min(1).max(100),
  studentCollege: z.string().min(1).max(200),
  studentMajor: z.string().min(1).max(200),
  studentCGPA: z.string().refine(
    (val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0.0 && num <= 4.0;
    },
    { message: "CGPA must be between 0.0 and 4.0" }
  ),
  personalStatement: z.string().max(2000).optional(),
  country: z.string().min(1).max(100),
  university: z.string().min(1).max(200),
  courses: z
    .array(
      z.object({
        code: z.string().min(1),
        status: z.enum(["approved", "conditional", "pending", "missing"]),
        hostCourseTitle: z.string().optional(),
        message: z.string(),
        notes: z.string().optional(),
      })
    )
    .min(1),
  allApproved: z.boolean(),
  nextStepAction: z.enum(["book_advising", "nomination_request"]).optional(),
  studentNotes: z.string().optional(),
});

function generateApplicationId(): string {
  return randomBytes(8).toString("hex");
}

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);

  const parsed = payloadSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.format() },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();
  const record: Application = {
    id: generateApplicationId(),
    status: "submitted",
    ...parsed.data,
    submittedAt: now,
    updatedAt: now,
  };

  const storageDir = path.join(process.cwd(), "data");
  const storageFile = path.join(storageDir, "applications-log.json");

  await fs.mkdir(storageDir, { recursive: true });

  let existing: Application[] = [];
  try {
    const contents = await fs.readFile(storageFile, "utf8");
    existing = JSON.parse(contents) as Application[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      console.error("Failed to read existing applications log", error);
    }
  }

  existing.push(record);
  await fs.writeFile(storageFile, JSON.stringify(existing, null, 2), "utf8");

  // Send emails to student and admin
  try {
    const { sendApplicationSubmissionEmails } = await import("@/lib/resendClient");
    const emailResult = await sendApplicationSubmissionEmails(record);
    
    if (!emailResult.success) {
      console.error("Email sending failed:", emailResult.error);
      // Don't fail the request, just log the error
    } else {
      console.info("[Course Mapping Application] Emails sent successfully");
    }
  } catch (emailError) {
    console.error("Email system error:", emailError);
    // Continue even if email fails
  }

  console.info("[Course Mapping Application]", record);

  return NextResponse.json({ ok: true, applicationId: record.id });
}
