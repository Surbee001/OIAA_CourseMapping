# Product Roadmap

## ✅ Admin Experience (COMPLETED)
- ✅ Built an authenticated admin panel that lists every submission with student details, contact info, country/university preference, and cached course results.
- ✅ Added stage tracking for each applicant (Draft -> Submitted -> Awaiting Nomination -> Nominated -> Session Booked -> Session Completed -> Approved/Rejected) with color-coded status pills and quick filters.
- ✅ Provided per-record actions to advance stage (nominate, mark session booked/completed, approve, delete).
- ✅ Surfaced metrics widgets (total applications, awaiting nomination, sessions booked, completed) to monitor pipeline health.
- ✅ Implemented secure admin login at `/adminlogin` with hardcoded credentials
- ✅ Created search functionality to find applications by name, email, ID, university, or country
- ✅ Built responsive, accessible UI matching the student portal aesthetic

### Future Admin Enhancements
- Add bulk actions (select multiple applications and update status)
- Implement advisor assignment workflow
- Add resend email functionality
- Create admin notes/commenting system
- Build audit trail showing who changed what and when

## Student Follow-up Workflow
- After results are shown, display a "Next Steps" page with dynamic guidance, appointment scheduling link, and direct nomination request button.
- Record student-selected action (book advising vs. nomination request) so admins see intent in the dashboard.
- Support optional notes that students can send to advisors when requesting help.

## Document Automation
- Create a document generator service that compiles required forms using approved course matches (only enabled when >= 3 courses are approved).
- Pre-fill institutional letter, course mapping summary, and credit transfer checklist; leave placeholders for signatures and supplementary uploads.
- Track which documents were generated/downloaded to avoid repetition and help admins verify completeness.

## Email + Notifications
- Implement transactional emails that include the evaluation summary, generated documents, and personalized guidance; personalize with student name and selected partner.
- Add CC/BCC options for advisors and allow admins to trigger resends.
- Log email history per student with timestamps and delivery status for compliance audits.

## Data Hygiene & Integrations
- Normalize university names and course codes at ingest to avoid dropdown duplication; warn admins about new typos.
- Sync submission events to CRM/sheet for the international team; expose export to CSV.
- Add audit trails (who changed status, when documents were regenerated) for governance.

## Nice-to-haves & Future Enhancements
- Embed a mini knowledge base for students (FAQs, policy docs) inside the wizard.
- Offer advisor-side commenting on submissions plus internal tagging (e.g., priority, scholarship candidate).
- Implement analytics (funnel conversion, average time in stage) to refine the process.
- Provide multilingual support for outgoing emails and documents if exchange partners require it.
