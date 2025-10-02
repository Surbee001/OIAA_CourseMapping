export type ApplicationStatus =
  | "draft"
  | "submitted"
  | "awaiting_nomination"
  | "nominated"
  | "session_booked"
  | "session_completed"
  | "approved"
  | "rejected";

export type CourseEvaluation = {
  code: string;
  status: "approved" | "conditional" | "pending" | "missing";
  hostCourseTitle?: string;
  message: string;
  notes?: string;
};

export type AdminCommentType = "note" | "document_request" | "process_update";

export type AdminCommentPage = "step_0" | "step_1" | "step_2" | "step_3" | "success_page";

export type AdminComment = {
  id: string;
  type: AdminCommentType;
  message: string;
  page: AdminCommentPage;
  createdAt: string;
  createdBy: string;
};

export type Application = {
  id: string;
  status: ApplicationStatus;
  studentName: string;
  studentId: string;
  studentEmail: string;
  studentNationality: string;
  studentCollege: string;
  studentMajor: string;
  studentCGPA: string;
  personalStatement?: string;
  country: string;
  university: string;
  courses: CourseEvaluation[];
  allApproved: boolean;
  submittedAt: string;
  updatedAt: string;
  nextStepAction?: "book_advising" | "nomination_request";
  studentNotes?: string;
  adminNotes?: string;
  adminComments?: AdminComment[];
};

export type ApplicationUpdate = {
  status?: ApplicationStatus;
  adminNotes?: string;
  adminComments?: AdminComment[];
};
