import { Resend } from "resend";
import { Application } from "@/types/application";
import {
  getStudentSubmissionEmailHTML,
  getAdminNotificationEmailHTML,
  getNominationApprovedEmailHTML,
} from "./emailTemplates";
import { generateApplicationPDF } from "./pdfGenerator";

const resend = new Resend(process.env.RESEND_API_KEY);

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "international@ajman.ac.ae";
const FROM_EMAIL = "OIAA Course Mapping <onboarding@resend.dev>";
const REPLY_TO_EMAIL = "h.mroue@ajman.ac.ae"; // Your personal email for replies

export async function sendApplicationSubmissionEmails(
  application: Application
): Promise<{ success: boolean; error?: string }> {
  try {
    // Generate PDF attachment
    const pdfBuffer = generateApplicationPDF(application);
    const pdfBase64 = pdfBuffer.toString("base64");

    // Send email to student
    const studentEmail = await resend.emails.send({
      from: FROM_EMAIL,
      replyTo: REPLY_TO_EMAIL,
      to: [application.studentEmail],
      subject: "Exchange Application Received - Ajman University",
      html: getStudentSubmissionEmailHTML(application),
      attachments: [
        {
          filename: `Application_${application.id}.pdf`,
          content: pdfBase64,
        },
      ],
    });

    if (studentEmail.error) {
      console.error("❌ Student email failed:", studentEmail.error);
      console.warn("💡 Tip: Add this email to verified emails in Resend dashboard:", application.studentEmail);
    } else {
      console.log("✅ Student email sent successfully:", studentEmail.data?.id);
    }

    // Send email to admin
    const adminEmail = await resend.emails.send({
      from: FROM_EMAIL,
      replyTo: application.studentEmail, // Admin can reply directly to student
      to: [ADMIN_EMAIL],
      subject: `New Application: ${application.studentName} - ${application.university}`,
      html: getAdminNotificationEmailHTML(application),
      attachments: [
        {
          filename: `Application_${application.id}.pdf`,
          content: pdfBase64,
        },
      ],
    });

    if (adminEmail.error) {
      console.error("❌ Admin email failed:", adminEmail.error);
      console.warn("💡 Tip: Add this email to verified emails in Resend dashboard:", ADMIN_EMAIL);
    } else {
      console.log("✅ Admin email sent successfully:", adminEmail.data?.id);
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to send submission emails:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function sendNominationApprovedEmail(
  application: Application
): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      replyTo: REPLY_TO_EMAIL,
      to: [application.studentEmail],
      subject: "🎉 Nomination Approved - Exchange Program",
      html: getNominationApprovedEmailHTML(application),
    });

    console.log("Nomination approved email sent:", result);

    return { success: true };
  } catch (error) {
    console.error("Failed to send nomination email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
