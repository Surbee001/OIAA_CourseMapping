# Global Mobility Course Mapping

A streamlined web application built with Next.js and TypeScript for the Office of International Affairs and Accreditation (OIAA). Students can confirm partner university eligibility, map required courses, and submit an application for advisor review in one guided flow.

## ✨ Features

### Student Portal
- Guided, animated wizard that captures student details, destination preferences, and required courses
- Real-time eligibility checks against an Excel course mapping (with a demo dataset bundled)
- Instant Excel uploads (`.xlsx`) to refresh the catalogue without redeploying
- Clear approval summary with status pills for approved, conditional, pending, and unmapped courses
- Application submission endpoint that logs entries to `data/applications-log.json`

### Admin Panel
- Secure admin login at `/adminlogin` with hardcoded credentials
- Comprehensive dashboard at `/admin` showing all applications with filters and search
- Status tracking (Draft → Submitted → Awaiting Nomination → Nominated → Session Booked → Session Completed → Approved/Rejected)
- Color-coded status pills and quick filters for workflow management
- Metrics widgets showing total applications, high-priority nominations, sessions, and completed cases
- Per-application actions to advance workflow stages
- Responsive design matching the student portal aesthetic

### Design
- Minimal, black-and-white interface with the ABC Normal Book typeface
- Smooth animations powered by Framer Motion
- Responsive layout optimized for all screen sizes

## 🚀 Getting Started

```bash
npm install
npm run dev
```

Visit http://localhost:3000 to use the student wizard. The app reloads automatically as you make changes.

### Admin Access

Navigate to http://localhost:3000/adminlogin to access the admin panel.

**Default Credentials:**
- Email: `international@ajman.ac.ae`
- Password: `OI@a25`

See [ADMIN_SETUP.md](./ADMIN_SETUP.md) for detailed admin documentation.

## 📊 Working with Course Data

1. Prepare an Excel workbook (`.xlsx`) with the first sheet using these headers:
   - `Country`
   - `University`
   - `HomeCourseCode` (your campus course code like `MGT101`)
   - `HostCourseTitle` (the partner institution equivalent)
   - `Status` (include the word *Approved* for confirmed matches)
   - `Notes` (optional comments shown to students)
2. Click **Upload Excel mapping** in the app to load your sheet instantly.
3. The bundled sample dataset remains available if no file is uploaded.

The matcher normalises course codes (e.g. `mgt101` = `MGT101`) and scans the `Status` text for keywords such as *Approved* or *Conditional*. Anything missing or pending is highlighted so students know follow-up is required.

## 📬 Submission Handling & Email Hook

Submissions POST to `/api/applications`. Each entry is appended to `data/applications-log.json` with a timestamp so advisors can audit applications during testing.

To send real email notifications, extend `src/app/api/applications/route.ts`. For example, configure Nodemailer with your SMTP credentials or call an API such as SendGrid, Outlook, or Resend. Replace the `TODO` block with your provider call—payload data is already validated with Zod.

## 🛠️ Tech Stack

- Next.js App Router with TypeScript
- Framer Motion for subtle fades and transitions
- `xlsx` for browser-side Excel parsing
- Zod for robust request validation
- Modern CSS modules + design tokens for theming

## ✅ Quality Checks

Run the included lint task before committing:

```bash
npm run lint
```

---

Built with care to help OIAA students plan their study abroad journey confidently.

