# Email Notification System

This system uses **Resend** to send automated email notifications for the Course Mapping application flow.

## 📧 Email Flow

### 1. **Application Submission**
When a student submits their application:
- ✅ **Student receives:** Confirmation email with application summary + PDF attachment
- ✅ **Admin receives:** Notification email with student details + PDF attachment

### 2. **Nomination Approved**
When admin approves a nomination:
- ✅ **Student receives:** Congratulations email with next steps

---

## 🔧 Setup Instructions

### Step 1: Environment Variables

Your `.env.local` file already contains:
```env
RESEND_API_KEY=re_jZbc9WMP_BUZy1UrEKUDShkB94BTPv7vE
ADMIN_EMAIL=international@ajman.ac.ae
```

### Step 2: Verify Domain with Resend (Important!)

Currently, emails are sent from `onboarding@resend.dev` (Resend's test domain). **For production, you MUST verify your own domain.**

#### To add your domain:

1. Go to [Resend Dashboard](https://resend.com/domains)
2. Click **"Add Domain"**
3. Enter your domain (e.g., `ajman.ac.ae` or `oiaa.ajman.ac.ae`)
4. Add the DNS records to your domain provider:
   - **SPF Record** (TXT)
   - **DKIM Record** (TXT)
   - **DMARC Record** (TXT)
5. Wait for verification (usually 5-30 minutes)

#### Update the FROM email:

Once verified, update `src/lib/resendClient.ts`:

```typescript
const FROM_EMAIL = "OIAA <noreply@ajman.ac.ae>"; // Change this to your verified domain
```

**Examples:**
- `"OIAA <noreply@ajman.ac.ae>"`
- `"International Office <international@ajman.ac.ae>"`
- `"Ajman University <exchange@ajman.ac.ae>"`

---

## 📄 Email Templates

### Student Submission Email
**File:** `src/lib/emailTemplates.ts` → `getStudentSubmissionEmailHTML()`

**Includes:**
- Success icon
- Application summary (university, courses, pre-approved count)
- Next steps (what happens after submission)
- PDF attachment of full application

### Admin Notification Email
**File:** `src/lib/emailTemplates.ts` → `getAdminNotificationEmailHTML()`

**Includes:**
- Alert banner ("Action required")
- Student information (name, ID, email, CGPA)
- Application details (university, course breakdown)
- Link to admin dashboard
- PDF attachment of full application

### Nomination Approved Email
**File:** `src/lib/emailTemplates.ts` → `getNominationApprovedEmailHTML()`

**Includes:**
- Congratulations message
- Celebration banner
- Next steps (documentation, orientation, visa process)
- Contact information

---

## 🎨 Customization

### Modify Email Content

Edit templates in `src/lib/emailTemplates.ts`. Each template is a function that returns HTML.

**Example:**
```typescript
export function getStudentSubmissionEmailHTML(application: Application): string {
  // Modify HTML here
  return `...`;
}
```

### Modify PDF Layout

Edit `src/lib/pdfGenerator.ts` to change the PDF structure, styling, or content.

**Key sections:**
- Header with logo
- Student information table
- Personal statement
- Destination details
- Course mapping table with status colors

---

## 📨 Testing Emails

### Test in Development

1. Submit a test application
2. Check console logs for email status
3. Check your email inbox (student email from form)
4. Check admin inbox (`international@ajman.ac.ae`)

### Test Domain Setup

If emails aren't arriving:

1. **Check Resend logs:** [resend.com/emails](https://resend.com/emails)
2. **Check spam folder**
3. **Verify DNS records are correct**
4. **Ensure domain is verified** (green checkmark in Resend dashboard)

### Using Test Mode

Resend's test domain (`onboarding@resend.dev`) will only deliver to:
- Your verified email addresses in Resend
- Email addresses you've added as "Verified Emails" in Resend

**For full testing**, add test recipient emails in Resend Dashboard under "Verified Emails" or use your own domain.

---

## 🔐 Security Notes

- ✅ API key is stored in `.env.local` (not committed to git)
- ✅ `.env*` is in `.gitignore`
- ✅ All emails include PDF attachments generated server-side
- ⚠️ **Never commit your Resend API key to version control**

---

## 📊 API Integration Points

### Application Submission
**File:** `src/app/api/applications/route.ts`

After saving application:
```typescript
const { sendApplicationSubmissionEmails } = await import("@/lib/resendClient");
await sendApplicationSubmissionEmails(record);
```

### Nomination Approval
**File:** `src/app/api/admin/applications/[id]/route.ts`

When status changes to `nominated` or `approved`:
```typescript
const { sendNominationApprovedEmail } = await import("@/lib/resendClient");
await sendNominationApprovedEmail(application);
```

---

## 🚀 Production Checklist

Before going live:

- [ ] Verify domain with Resend
- [ ] Update `FROM_EMAIL` in `src/lib/resendClient.ts`
- [ ] Test all email flows (submission, nomination)
- [ ] Check emails render correctly on mobile
- [ ] Verify PDF attachments open correctly
- [ ] Set up email monitoring/alerts
- [ ] Add `NEXT_PUBLIC_BASE_URL` to `.env.local` for correct admin dashboard links
- [ ] Update admin email address if needed

---

## 💰 Pricing

Resend pricing (as of 2024):
- **Free tier:** 100 emails/day, 3,000 emails/month
- **Pay-as-you-go:** $0.001/email after free tier
- **Pro:** $20/month (unlimited domains, 50k emails/month)

**For Ajman University:** Free tier should be sufficient initially (3k emails = ~300 applications with 10 emails each)

---

## 📞 Support

- **Resend Docs:** [resend.com/docs](https://resend.com/docs)
- **Resend Support:** support@resend.com
- **Email Issues:** Check Resend dashboard logs for delivery status

---

## 🎯 Future Enhancements

Potential improvements:
- Add email templates for more statuses (rejected, session booked, etc.)
- Add dynamic content based on approval status
- Implement email queuing for bulk notifications
- Add email analytics tracking
- Support for Arabic language emails
- Add SMS notifications via Twilio
- Calendar invites for advising sessions
