import { Application } from "@/types/application";

export function getStudentSubmissionEmailHTML(application: Application): string {
  const { studentName, university, country, courses } = application;
  const approvedCount = courses.filter(c => c.status === "approved").length;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Received</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 8px; border: 1px solid #dcdcdc;">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 32px; text-align: center; border-bottom: 1px solid #dcdcdc;">
              <img src="https://github.com/Surbee001/webimg/blob/main/Artboard%201.png?raw=true" alt="OIAA Logo" style="height: 70px; margin-bottom: 20px;">
              <h1 style="margin: 0; font-size: 26px; font-weight: 500; color: #111111; letter-spacing: -0.02em;">Application Received</h1>
            </td>
          </tr>

          <!-- Success Icon -->
          <tr>
            <td style="padding: 36px 40px 24px; text-align: center;">
              <div style="width: 72px; height: 72px; margin: 0 auto; background-color: #111111; border-radius: 50%;">
                <table role="presentation" width="72" height="72" cellspacing="0" cellpadding="0">
                  <tr>
                    <td align="center" valign="middle">
                      <span style="font-size: 32px; line-height: 72px; color: #ffffff;">✓</span>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 0 40px 32px;">
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #374151;">
                Dear <strong>${studentName}</strong>,
              </p>
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #374151;">
                Thank you for submitting your exchange application to <strong>${university}, ${country}</strong>. We have successfully received your application and it is now under review by our team.
              </p>

              <!-- Application Summary Box -->
              <div style="background-color: #f5f5f5; border: 1px solid #dcdcdc; border-radius: 6px; padding: 24px; margin: 24px 0;">
                <h3 style="margin: 0 0 16px; font-size: 13px; font-weight: 600; color: #666666; text-transform: uppercase; letter-spacing: 0.08em;">Application Summary</h3>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="padding: 8px 0; font-size: 15px; color: #666666;">University:</td>
                    <td style="padding: 8px 0; font-size: 15px; color: #111111; font-weight: 500; text-align: right;">${university}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-size: 15px; color: #666666;">Country:</td>
                    <td style="padding: 8px 0; font-size: 15px; color: #111111; font-weight: 500; text-align: right;">${country}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-size: 15px; color: #666666;">Courses Submitted:</td>
                    <td style="padding: 8px 0; font-size: 15px; color: #111111; font-weight: 500; text-align: right;">${courses.length}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-size: 15px; color: #666666;">Pre-Approved:</td>
                    <td style="padding: 8px 0; font-size: 15px; color: #111111; font-weight: 600; text-align: right;">${approvedCount} courses</td>
                  </tr>
                </table>
              </div>

              <p style="margin: 24px 0 16px; font-size: 16px; font-weight: 600; color: #111111;">What happens next?</p>
              <ol style="margin: 0 0 24px; padding-left: 20px; font-size: 15px; line-height: 1.8; color: #374151;">
                <li style="margin-bottom: 8px;">Our team will review your application within <strong>2-3 business days</strong></li>
                <li style="margin-bottom: 8px;">You'll receive an email confirmation once your application is processed</li>
                <li style="margin-bottom: 8px;">If needed, we may contact you for additional information</li>
              </ol>

              <p style="margin: 24px 0 0; font-size: 14px; line-height: 1.6; color: #6b7280;">
                A detailed PDF copy of your application is attached to this email for your records.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f5f5f5; border-top: 1px solid #dcdcdc; border-radius: 0 0 8px 8px;">
              <p style="margin: 0 0 8px; font-size: 13px; color: #666666; text-align: center;">
                Office of International Academic Affairs
              </p>
              <p style="margin: 0; font-size: 13px; color: #666666; text-align: center;">
                Ajman University | <a href="mailto:international@ajman.ac.ae" style="color: #111111; text-decoration: underline;">international@ajman.ac.ae</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export function getAdminNotificationEmailHTML(application: Application): string {
  const { studentName, studentId, studentEmail, studentCGPA, university, country, courses } = application;
  const approvedCount = courses.filter(c => c.status === "approved").length;
  const conditionalCount = courses.filter(c => c.status === "conditional").length;
  const pendingCount = courses.filter(c => c.status === "pending").length;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Application Submitted</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 8px; border: 1px solid #dcdcdc;">
          
          <!-- Header -->
          <tr>
            <td style="padding: 32px 40px 24px; background-color: #111111; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; font-size: 22px; font-weight: 600; color: #ffffff;">🔔 New Application Submitted</h1>
              <p style="margin: 8px 0 0; font-size: 14px; color: #d1d5db;">Action required: Review student exchange application</p>
            </td>
          </tr>

          <!-- Student Info -->
          <tr>
            <td style="padding: 32px 40px 24px;">
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 6px; padding: 16px 20px; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 13px; font-weight: 600; color: #92400e; text-transform: uppercase; letter-spacing: 0.5px;">⚡ Requires Review</p>
              </div>

              <h2 style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #111111;">Student Information</h2>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="padding: 8px 0; font-size: 14px; color: #6b7280; width: 140px;">Name:</td>
                  <td style="padding: 8px 0; font-size: 14px; color: #111111; font-weight: 500;">${studentName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-size: 14px; color: #6b7280;">Student ID:</td>
                  <td style="padding: 8px 0; font-size: 14px; color: #111111; font-weight: 500;">${studentId}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-size: 14px; color: #6b7280;">Email:</td>
                  <td style="padding: 8px 0; font-size: 14px; color: #3b82f6;"><a href="mailto:${studentEmail}" style="color: #3b82f6; text-decoration: none;">${studentEmail}</a></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-size: 14px; color: #6b7280;">CGPA:</td>
                  <td style="padding: 8px 0; font-size: 14px; color: #111111; font-weight: 500;">${studentCGPA}</td>
                </tr>
              </table>

              <h2 style="margin: 24px 0 16px; font-size: 18px; font-weight: 600; color: #111111;">Application Details</h2>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="padding: 8px 0; font-size: 14px; color: #6b7280; width: 140px;">Destination:</td>
                  <td style="padding: 8px 0; font-size: 14px; color: #111111; font-weight: 500;">${university}, ${country}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-size: 14px; color: #6b7280;">Total Courses:</td>
                  <td style="padding: 8px 0; font-size: 14px; color: #111111; font-weight: 500;">${courses.length}</td>
                </tr>
              </table>

              <!-- Course Status Breakdown -->
              <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 24px 0;">
                <h3 style="margin: 0 0 16px; font-size: 15px; font-weight: 600; color: #111111;">Course Status Breakdown</h3>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="padding: 10px 16px; background-color: #dcfce7; border-radius: 6px; margin-bottom: 8px;">
                      <span style="font-size: 14px; color: #15803d; font-weight: 600;">${approvedCount} Approved</span>
                    </td>
                  </tr>
                  ${conditionalCount > 0 ? `
                  <tr><td style="height: 8px;"></td></tr>
                  <tr>
                    <td style="padding: 10px 16px; background-color: #fef3c7; border-radius: 6px;">
                      <span style="font-size: 14px; color: #92400e; font-weight: 600;">${conditionalCount} Conditional</span>
                    </td>
                  </tr>
                  ` : ''}
                  ${pendingCount > 0 ? `
                  <tr><td style="height: 8px;"></td></tr>
                  <tr>
                    <td style="padding: 10px 16px; background-color: #e0e7ff; border-radius: 6px;">
                      <span style="font-size: 14px; color: #3730a3; font-weight: 600;">${pendingCount} Pending</span>
                    </td>
                  </tr>
                  ` : ''}
                </table>
              </div>

              <p style="margin: 24px 0 16px; font-size: 14px; line-height: 1.6; color: #6b7280;">
                The complete application form with all course details is attached as a PDF.
              </p>

              <!-- Action Button -->
              <div style="text-align: center; margin: 32px 0 0;">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/admin" style="display: inline-block; background-color: #111111; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 999px; font-size: 15px; font-weight: 500;">
                  View in Admin Dashboard →
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f9fafb; border-top: 1px solid #e5e5e5; border-radius: 0 0 12px 12px;">
              <p style="margin: 0; font-size: 13px; color: #9ca3af; text-align: center;">
                This is an automated notification from the Course Mapping System
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export function getNominationApprovedEmailHTML(application: Application): string {
  const { studentName, university, country } = application;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0;">
  <title>Nomination Approved!</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 8px; border: 1px solid #dcdcdc;">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 32px; text-align: center; border-bottom: 1px solid #e5e5e5;">
              <img src="https://github.com/Surbee001/webimg/blob/main/Artboard%201.png?raw=true" alt="OIAA Logo" style="height: 60px; margin-bottom: 16px;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 600; color: #10b981;">Congratulations!</h1>
            </td>
          </tr>

          <!-- Success Message -->
          <tr>
            <td style="padding: 32px 40px;">
              <div style="text-align: center; margin-bottom: 32px;">
                <div style="display: inline-block; background-color: #dcfce7; border: 2px solid #86efac; border-radius: 999px; padding: 12px 24px;">
                  <span style="font-size: 15px; font-weight: 600; color: #15803d;">✓ Nomination Approved</span>
                </div>
              </div>

              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #374151;">
                Dear <strong>${studentName}</strong>,
              </p>
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #374151;">
                We are delighted to inform you that your nomination for the exchange program at <strong>${university}, ${country}</strong> has been <strong style="color: #10b981;">approved</strong>!
              </p>

              <!-- Celebration Banner -->
              <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 12px; padding: 32px 24px; text-align: center; margin: 32px 0;">
                <p style="margin: 0; font-size: 18px; font-weight: 600; color: #ffffff;">🎉 You're one step closer to your exchange journey!</p>
              </div>

              <p style="margin: 24px 0 16px; font-size: 16px; font-weight: 600; color: #111111;">Next Steps:</p>
              <ol style="margin: 0 0 24px; padding-left: 20px; font-size: 15px; line-height: 1.8; color: #374151;">
                <li style="margin-bottom: 12px;">Check your email for detailed documentation requirements</li>
                <li style="margin-bottom: 12px;">Complete any remaining paperwork within <strong>14 days</strong></li>
                <li style="margin-bottom: 12px;">Attend the mandatory pre-departure orientation session</li>
                <li style="margin-bottom: 12px;">Our team will contact you shortly to guide you through the visa process</li>
              </ol>

              <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 6px; padding: 20px; margin: 24px 0;">
                <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #1e40af;">
                  <strong>Important:</strong> Please monitor your email regularly for updates and respond promptly to any requests from our office.
                </p>
              </div>

              <p style="margin: 24px 0 0; font-size: 15px; line-height: 1.6; color: #6b7280;">
                If you have any questions, please don't hesitate to contact us at <a href="mailto:international@ajman.ac.ae" style="color: #3b82f6; text-decoration: none;">international@ajman.ac.ae</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f5f5f5; border-top: 1px solid #dcdcdc; border-radius: 0 0 8px 8px;">
              <p style="margin: 0 0 8px; font-size: 13px; color: #666666; text-align: center;">
                Office of International Academic Affairs
              </p>
              <p style="margin: 0; font-size: 13px; color: #666666; text-align: center;">
                Ajman University | <a href="mailto:international@ajman.ac.ae" style="color: #111111; text-decoration: underline;">international@ajman.ac.ae</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
