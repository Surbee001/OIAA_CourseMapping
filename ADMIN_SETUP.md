# Admin Panel Setup & Usage

## 🔐 Access Credentials

The admin panel uses hardcoded credentials for secure access:

- **Email**: `international@ajman.ac.ae`
- **Password**: `OI@a25`

## 📍 Routes

### Student Portal
- `/` - Main application form for students

### Admin Portal
- `/adminlogin` - Admin login page
- `/admin` - Admin dashboard (requires authentication)

## 🎯 Admin Dashboard Features

### Metrics Overview
The dashboard displays key metrics at the top:
- **Total Applications** - All submitted applications
- **Awaiting Nomination** - High priority applications needing quick action
- **Sessions Booked** - Students who have scheduled advising sessions
- **Completed** - Applications that have been processed

### Filters
Quick filters to view applications by status:
- **All** - View all applications
- **Awaiting Nomination** - Priority queue (recommended to process first)
- **Submitted** - Newly submitted applications
- **Session Booked** - Applications with scheduled sessions

### Search
Search bar supports filtering by:
- Student name
- Student email
- Student ID
- University name
- Country

### Application Cards
Each application card displays:
- Student information (name, email, ID, CGPA)
- Destination (country and university)
- College and major
- Submission date
- Course evaluation results with status badges
- Action buttons based on current status

### Available Actions

#### For Submitted Applications
- **Mark as Awaiting Nomination** - Move to priority queue

#### For Applications Awaiting Nomination
- **Nominate Student** - Mark as officially nominated

#### For Nominated Students
- **Mark Session Booked** - Indicate advising session has been scheduled

#### For Students with Booked Sessions
- **Mark Session Completed** - Record that advising session is finished

#### For Completed or Nominated Applications
- **Approve Application** - Final approval

#### All Applications
- **Delete** - Remove application (requires confirmation)

## 🔄 Application Status Flow

The typical application workflow:

1. **Draft** → Student is filling out the form (not shown in admin panel)
2. **Submitted** → Application received, awaiting admin review
3. **Awaiting Nomination** → High priority, needs quick nomination
4. **Nominated** → Student has been officially nominated
5. **Session Booked** → Advising session has been scheduled
6. **Session Completed** → Session finished, pending final approval
7. **Approved** → Application fully processed
8. **Rejected** → Application declined (available from any status)

## 🎨 UI Design

The admin panel follows the same design aesthetic as the student application:
- Clean, minimal black and white interface
- ABC Normal Book typeface
- Smooth animations and transitions
- Responsive design for all screen sizes
- Color-coded status pills for quick visual scanning

## 🔒 Security Features

- Session-based authentication with 24-hour expiry
- HTTP-only cookies
- Secure session tokens
- Protected API routes requiring authentication
- Admin-only access to sensitive operations

## 📊 Data Storage

Applications are stored in `data/applications-log.json` with the following structure:

```json
{
  "id": "unique-application-id",
  "status": "submitted",
  "studentName": "Student Name",
  "studentId": "202145678",
  "studentEmail": "student@ajmanuni.ac.ae",
  "studentNationality": "United Arab Emirates",
  "studentCollege": "College Name",
  "studentMajor": "Major Name",
  "studentCGPA": "3.65",
  "personalStatement": "Optional statement",
  "country": "Destination Country",
  "university": "Partner University",
  "courses": [
    {
      "code": "MGT101",
      "status": "approved",
      "hostCourseTitle": "Management Fundamentals",
      "message": "Approved match found",
      "notes": "Optional course notes"
    }
  ],
  "allApproved": true,
  "submittedAt": "2025-09-30T12:00:00.000Z",
  "updatedAt": "2025-09-30T12:00:00.000Z"
}
```

## 🚀 Getting Started

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/adminlogin`

3. Enter admin credentials:
   - Email: `international@ajman.ac.ae`
   - Password: `OI@a25`

4. Access the dashboard and start managing applications

## 📝 Best Practices

1. **Priority Queue**: Check "Awaiting Nomination" filter regularly for time-sensitive applications
2. **Search**: Use the search bar to quickly find specific students
3. **Status Updates**: Keep application statuses current to maintain workflow visibility
4. **Session Management**: Mark sessions as completed promptly to track progress
5. **Data Backup**: Regularly backup `data/applications-log.json` for safety

## 🔧 Future Enhancements

Potential features to implement (see TODO.md):
- Email notifications to students and advisors
- Document generation (nomination letters, credit transfer forms)
- Admin notes and commenting on applications
- Bulk actions for multiple applications
- Export to CSV for reporting
- Audit trail for status changes
- Integration with CRM systems

---

**Built for OIAA** - Streamlining international student mobility
