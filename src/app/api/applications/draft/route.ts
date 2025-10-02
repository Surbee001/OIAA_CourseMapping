import { NextResponse } from "next/server";
import { z } from "zod";
import { Application } from "@/types/application";
import { randomBytes } from "crypto";
import { readApplications, updateApplication, addApplication } from "@/lib/storage";

const draftSchema = z.object({
  id: z.string().optional(),
  studentName: z.string().max(100).optional(),
  studentId: z.string().max(50).optional(),
  studentEmail: z.string().email().max(100).optional(),
  studentNationality: z.string().max(100).optional(),
  studentCollege: z.string().max(200).optional(),
  studentMajor: z.string().max(200).optional(),
  studentCGPA: z.string()
    .refine(
      (val) => {
        if (!val) return true; // Optional field
        const num = parseFloat(val);
        return !isNaN(num) && num >= 0.0 && num <= 4.0;
      },
      { message: "CGPA must be between 0.0 and 4.0" }
    )
    .optional(),
  personalStatement: z.string().max(2000).optional(),
  country: z.string().max(100).optional(),
  university: z.string().max(200).optional(),
  courses: z.array(z.object({
    code: z.string(),
    status: z.enum(["approved", "conditional", "pending", "missing"]),
    hostCourseTitle: z.string().optional(),
    message: z.string(),
    notes: z.string().optional(),
  })).optional(),
  currentStep: z.number().optional(),
});

function generateDraftId(): string {
  return `draft-${randomBytes(6).toString("hex")}`;
}

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = draftSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.format() },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const now = new Date().toISOString();

  // If ID exists, update existing draft
  if (data.id) {
    const updatedDraft = await updateApplication(data.id, {
      ...data,
      status: "draft",
    } as Partial<Application>);
    
    if (updatedDraft && updatedDraft.status === "draft") {
      return NextResponse.json({
        success: true,
        draftId: data.id,
        draft: updatedDraft,
      });
    }
  }

  // Create new draft
  const draftId = generateDraftId();
  const newDraft: Application = {
    id: draftId,
    status: "draft",
    studentName: data.studentName || "",
    studentId: data.studentId || "",
    studentEmail: data.studentEmail || "",
    studentNationality: data.studentNationality || "",
    studentCollege: data.studentCollege || "",
    studentMajor: data.studentMajor || "",
    studentCGPA: data.studentCGPA || "",
    personalStatement: data.personalStatement,
    country: data.country || "",
    university: data.university || "",
    courses: data.courses || [],
    allApproved: false,
    submittedAt: now,
    updatedAt: now,
  };

  await addApplication(newDraft);

  return NextResponse.json({
    success: true,
    draftId,
    draft: newDraft,
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const draftId = searchParams.get("id");

  if (!draftId) {
    return NextResponse.json(
      { error: "Draft ID required" },
      { status: 400 }
    );
  }

  const applications = await readApplications();
  const draft = applications.find(app => app.id === draftId && app.status === "draft");

  if (!draft) {
    return NextResponse.json(
      { error: "Draft not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ draft });
}

