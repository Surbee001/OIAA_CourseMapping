import { NextResponse } from "next/server";
import { z } from "zod";
import { Application } from "@/types/application";
import { randomBytes } from "crypto";
import { addApplication } from "@/lib/storage";

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

  // Save to Vercel Blob Storage
  const saved = await addApplication(record);
  
  if (!saved) {
    console.error("[Course Mapping Application] Failed to save to blob storage");
    // Log the application data so it's not lost
    console.log("[Course Mapping Application] Data:", JSON.stringify(record, null, 2));
  } else {
    console.info("[Course Mapping Application] Saved:", record.id);
  }

  // Send emails in background (completely silent - never block the response)
  setImmediate(async () => {
    try {
      const { sendApplicationSubmissionEmails } = await import("@/lib/resendClient");
      const emailResult = await sendApplicationSubmissionEmails(record);
      
      if (!emailResult.success) {
        console.log("[Email] Failed to send:", emailResult.error);
      } else {
        console.log("[Email] Sent successfully");
      }
    } catch (emailError) {
      console.log("[Email] Skipped due to error:", emailError instanceof Error ? emailError.message : String(emailError));
    }
  });

  return NextResponse.json({ ok: true, applicationId: record.id });
}
