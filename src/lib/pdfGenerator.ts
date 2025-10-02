import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Application } from "@/types/application";

export function generateApplicationPDF(application: Application): Buffer {
  const doc = new jsPDF();
  
  // Header with logo
  doc.setFillColor(17, 17, 17);
  doc.rect(0, 0, 210, 35, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Exchange Application", 105, 15, { align: "center" });
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Office of International Academic Affairs", 105, 23, { align: "center" });
  doc.text("Ajman University", 105, 29, { align: "center" });
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
  
  // Application ID
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);
  doc.text(`Application ID: ${application.id}`, 14, 45);
  doc.text(`Submitted: ${new Date(application.submittedAt).toLocaleDateString()}`, 14, 51);
  
  // Student Information Section
  let yPos = 62;
  doc.setFontSize(14);
  doc.setTextColor(17, 17, 17);
  doc.setFont("helvetica", "bold");
  doc.text("Student Information", 14, yPos);
  
  yPos += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  const studentInfo = [
    ["Name", application.studentName],
    ["Student ID", application.studentId],
    ["Email", application.studentEmail],
    ["Nationality", application.studentNationality],
    ["College", application.studentCollege],
    ["Major", application.studentMajor],
    ["CGPA", application.studentCGPA],
  ];
  
  autoTable(doc, {
    startY: yPos,
    head: [],
    body: studentInfo,
    theme: "plain",
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: {
      0: { fontStyle: "bold", textColor: [107, 114, 128], cellWidth: 40 },
      1: { textColor: [17, 17, 17] },
    },
  });
  
  // Personal Statement
  yPos = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  if (application.personalStatement) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Personal Statement", 14, yPos);
    
    yPos += 7;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(55, 65, 81);
    
    const splitStatement = doc.splitTextToSize(application.personalStatement, 180);
    doc.text(splitStatement, 14, yPos);
    yPos += splitStatement.length * 5 + 10;
  } else {
    yPos += 5;
  }
  
  // Destination Section
  if (yPos > 240) {
    doc.addPage();
    yPos = 20;
  }
  
  doc.setFontSize(14);
  doc.setTextColor(17, 17, 17);
  doc.setFont("helvetica", "bold");
  doc.text("Exchange Destination", 14, yPos);
  
  yPos += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  const destinationInfo = [
    ["University", application.university],
    ["Country", application.country],
  ];
  
  autoTable(doc, {
    startY: yPos,
    head: [],
    body: destinationInfo,
    theme: "plain",
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: {
      0: { fontStyle: "bold", textColor: [107, 114, 128], cellWidth: 40 },
      1: { textColor: [17, 17, 17] },
    },
  });
  
  // Course Mapping Section
  yPos = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  
  if (yPos > 240) {
    doc.addPage();
    yPos = 20;
  }
  
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Course Mapping", 14, yPos);
  
  yPos += 5;
  
  const courseData = application.courses.map((course, index) => {
    let statusLabel: string;

    switch (course.status) {
      case "approved":
        statusLabel = "Approved";
        break;
      case "conditional":
        statusLabel = "Conditional";
        break;
      case "pending":
        statusLabel = "Pending";
        break;
      default:
        statusLabel = "Missing";
    }
    
    return [
      (index + 1).toString(),
      course.code,
      course.hostCourseTitle || "—",
      statusLabel,
    ];
  });
  
  autoTable(doc, {
    startY: yPos,
    head: [["#", "Course Code", "Host Course", "Status"]],
    body: courseData,
    theme: "striped",
    headStyles: {
      fillColor: [17, 17, 17],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 10,
    },
    styles: {
      fontSize: 9,
      cellPadding: 4,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 35, fontStyle: "bold" },
      2: { cellWidth: 90 },
      3: { cellWidth: 35, halign: "center" },
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    didParseCell: (data: any) => {
      if (data.section === "body" && data.column.index === 3) {
        const statusText = data.cell.text[0];
        if (statusText.includes("Approved")) {
          data.cell.styles.textColor = [16, 185, 129];
          data.cell.styles.fontStyle = "bold";
        } else if (statusText.includes("Conditional")) {
          data.cell.styles.textColor = [245, 158, 11];
          data.cell.styles.fontStyle = "bold";
        } else if (statusText.includes("Pending")) {
          data.cell.styles.textColor = [59, 130, 246];
        } else {
          data.cell.styles.textColor = [156, 163, 175];
        }
      }
    },
  });
  
  // Footer on every page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text(
      `Page ${i} of ${pageCount}`,
      105,
      285,
      { align: "center" }
    );
    doc.text(
      "Office of International Academic Affairs | international@ajman.ac.ae",
      105,
      290,
      { align: "center" }
    );
  }
  
  // Convert to buffer
  const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
  return pdfBuffer;
}
