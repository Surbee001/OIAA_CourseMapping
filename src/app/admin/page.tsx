"use client";

import { useState, useEffect, useMemo } from "react";
import { Application, ApplicationStatus } from "@/types/application";
import styles from "./page.module.css";

type FilterStatus = "all" | ApplicationStatus;

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  awaiting_nomination: "Awaiting Nomination",
  nominated: "Nominated",
  session_booked: "Session Booked",
  session_completed: "Session Completed",
  approved: "Approved",
  rejected: "Rejected",
};

export default function AdminPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number; transform: string } | null>(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentType, setCommentType] = useState<"note" | "document_request" | "process_update">("note");
  const [commentPage, setCommentPage] = useState<"step_0" | "step_1" | "step_2" | "step_3" | "success_page">("step_0");
  const [commentMessage, setCommentMessage] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    checkAuth();
    loadApplications();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/verify");
      if (!response.ok) {
        window.location.href = "/adminlogin";
        return;
      }
      const data = await response.json();
      setAdminEmail(data.session?.email || null);
    } catch (error) {
      console.error("Auth check failed:", error);
      window.location.href = "/adminlogin";
    }
  };

  const loadApplications = async () => {
    try {
      const response = await fetch("/api/admin/applications");
      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = "/adminlogin";
          return;
        }
        throw new Error("Failed to load applications");
      }
      const data = await response.json();
      setApplications(data.applications || []);
    } catch (error) {
      console.error("Failed to load applications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/adminlogin";
    } catch (error) {
      console.error("Logout failed:", error);
      window.location.href = "/adminlogin";
    }
  };

  const updateApplicationStatus = async (
    id: string,
    status: ApplicationStatus
  ) => {
    try {
      const response = await fetch(`/api/admin/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Failed to update application");
      }

      const data = await response.json();
      setApplications((prev) =>
        prev.map((app) => (app.id === id ? data.application : app))
      );
      setOpenMenuId(null);
    } catch (error) {
      console.error("Failed to update application:", error);
      alert("Failed to update application. Please try again.");
    }
  };

  const deleteApplication = async (id: string) => {
    if (!confirm("Are you sure you want to delete this application?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/applications/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete application");
      }

      setApplications((prev) => prev.filter((app) => app.id !== id));
      setOpenMenuId(null);
    } catch (error) {
      console.error("Failed to delete application:", error);
      alert("Failed to delete application. Please try again.");
    }
  };

  const handleAddComment = async () => {
    if (!selectedApp || !commentMessage.trim()) return;

    setIsSubmittingComment(true);
    try {
      const response = await fetch(`/api/admin/applications/${selectedApp.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: commentType,
          message: commentMessage,
          page: commentPage,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add comment");
      }

      const data = await response.json();
      
      // Update local state
      setApplications((prev) =>
        prev.map((app) => (app.id === selectedApp.id ? data.application : app))
      );
      setSelectedApp(data.application);
      
      // Reset form
      setCommentMessage("");
      setCommentType("note");
      setCommentPage("step_0");
      
      alert("Comment added successfully!");
    } catch (error) {
      console.error("Failed to add comment:", error);
      alert("Failed to add comment. Please try again.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDownloadPDF = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/applications/${id}/download`);
      
      if (!response.ok) {
        throw new Error("Failed to download PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `application-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Failed to download PDF:", error);
      alert("Failed to download PDF. Please try again.");
    }
  };

  const filteredApplications = useMemo(() => {
    let filtered = applications;

    if (filterStatus !== "all") {
      filtered = filtered.filter((app) => app.status === filterStatus);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (app) =>
          app.studentName.toLowerCase().includes(query) ||
          app.studentEmail.toLowerCase().includes(query) ||
          app.studentId.toLowerCase().includes(query) ||
          app.university.toLowerCase().includes(query) ||
          app.country.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [applications, filterStatus, searchQuery]);

  const metrics = useMemo(() => {
    const total = applications.length;
    const submitted = applications.filter(
      (app) => app.status === "submitted"
    ).length;
    const awaitingNomination = applications.filter(
      (app) => app.status === "awaiting_nomination"
    ).length;
    const sessionBooked = applications.filter(
      (app) => app.status === "session_booked"
    ).length;
    const completed = applications.filter(
      (app) =>
        app.status === "session_completed" ||
        app.status === "approved" ||
        app.status === "nominated"
    ).length;

    return { total, submitted, awaitingNomination, sessionBooked, completed };
  }, [applications]);

  const getStatusClassName = (status: ApplicationStatus) => {
    const statusMap: Record<ApplicationStatus, string> = {
      draft: styles.statusDraft,
      submitted: styles.statusSubmitted,
      awaiting_nomination: styles.statusAwaitingNomination,
      nominated: styles.statusNominated,
      session_booked: styles.statusSessionBooked,
      session_completed: styles.statusSessionCompleted,
      approved: styles.statusApproved,
      rejected: styles.statusRejected,
    };
    return `${styles.statusPill} ${statusMap[status]}`;
  };

  const getCourseStatusClassName = (
    status: "approved" | "conditional" | "pending" | "missing"
  ) => {
    const statusMap = {
      approved: styles.courseApproved,
      conditional: styles.courseConditional,
      pending: styles.coursePending,
      missing: styles.courseMissing,
    };
    return `${styles.courseBadge} ${statusMap[status]}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className={styles.shell}>
        <div className={styles.loadingState}>Loading applications...</div>
      </div>
    );
  }

  return (
    <div className={styles.shell}>
      <header className={styles.topBar}>
        <img
          src="https://github.com/Surbee001/webimg/blob/main/Artboard%201.png?raw=true"
          alt="Office of International Academic Affairs"
          className={styles.logo}
        />
        <div className={styles.topBarActions}>
          {adminEmail && (
            <span className={styles.adminEmail}>{adminEmail}</span>
          )}
          <button className={styles.logoutButton} onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.header}>
          <h1>Application Dashboard</h1>
          <p>Manage student exchange applications and track progress</p>
        </div>

        <div className={styles.metrics}>
          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Total Applications</span>
            <span className={styles.metricValue}>{metrics.total}</span>
          </div>
          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Awaiting Nomination</span>
            <span className={styles.metricValue}>
              {metrics.awaitingNomination}
            </span>
            <span className={styles.metricChange}>High priority</span>
          </div>
          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Sessions Booked</span>
            <span className={styles.metricValue}>{metrics.sessionBooked}</span>
          </div>
          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Completed</span>
            <span className={styles.metricValue}>{metrics.completed}</span>
          </div>
        </div>

        <div className={styles.filtersBar}>
          <div className={styles.filtersLabel}>Filter by status</div>
          <div className={styles.filters}>
            <button
              className={`${styles.filterChip} ${
                filterStatus === "all" ? styles.filterChipActive : ""
              }`}
              onClick={() => setFilterStatus("all")}
            >
              All ({applications.length})
            </button>
            <button
              className={`${styles.filterChip} ${
                filterStatus === "awaiting_nomination"
                  ? styles.filterChipActive
                  : ""
              }`}
              onClick={() => setFilterStatus("awaiting_nomination")}
            >
              Awaiting Nomination ({metrics.awaitingNomination})
            </button>
            <button
              className={`${styles.filterChip} ${
                filterStatus === "submitted" ? styles.filterChipActive : ""
              }`}
              onClick={() => setFilterStatus("submitted")}
            >
              Submitted ({metrics.submitted})
            </button>
            <button
              className={`${styles.filterChip} ${
                filterStatus === "session_booked" ? styles.filterChipActive : ""
              }`}
              onClick={() => setFilterStatus("session_booked")}
            >
              Session Booked ({metrics.sessionBooked})
            </button>
          </div>

          <div className={styles.searchBar}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search by name, email, ID, university..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {filteredApplications.length === 0 ? (
          <div className={styles.emptyState}>
            <h3>No applications found</h3>
            <p>
              {filterStatus !== "all"
                ? "Try adjusting your filters or search query"
                : "Applications will appear here once students submit"}
            </p>
          </div>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead className={styles.tableHeader}>
                <tr>
                  <th>Student</th>
                  <th>Destination</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th style={{ width: "180px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.map((app) => (
                  <tr key={app.id} className={styles.tableRow}>
                    <td className={styles.tableCell}>
                      <div className={styles.studentInfo}>
                        <span className={styles.studentName}>
                          {app.studentName}
                        </span>
                        <span className={styles.studentMeta}>
                          {app.studentEmail}
                        </span>
                        <span className={styles.studentMeta}>
                          ID: {app.studentId} • CGPA: {app.studentCGPA}
                        </span>
                      </div>
                    </td>
                    <td className={styles.tableCell}>
                      <div className={styles.studentInfo}>
                        <span className={styles.studentName}>
                          {app.university}
                        </span>
                        <span className={styles.studentMeta}>
                          {app.country}
                        </span>
                      </div>
                    </td>
                    <td className={styles.tableCell}>
                      {formatDate(app.submittedAt)}
                    </td>
                    <td className={styles.tableCell}>
                      <span className={getStatusClassName(app.status)}>
                        {STATUS_LABELS[app.status]}
                      </span>
                    </td>
                    <td className={styles.tableCell}>
                      <div className={styles.actionButtons}>
                        <button
                          className={styles.showMoreButton}
                          onClick={() => setSelectedApp(app)}
                        >
                          View Details
                        </button>
                        <div style={{ position: "relative" }}>
                          <button
                            className={styles.menuButton}
                            onClick={(e) => {
                              if (openMenuId === app.id) {
                                setOpenMenuId(null);
                                setMenuPosition(null);
                              } else {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const dropdownHeight = 380; // Approximate dropdown height
                                const spaceBelow = window.innerHeight - rect.bottom;
                                const openUpward = spaceBelow < dropdownHeight + 50;
                                
                                setMenuPosition({
                                  top: openUpward ? rect.top - 4 : rect.bottom + 4,
                                  left: rect.right - 220,
                                  transform: openUpward ? 'translateY(-100%)' : 'translateY(0)',
                                });
                                setOpenMenuId(app.id);
                              }
                            }}
                          >
                            ⋯
                          </button>
                          {openMenuId === app.id && menuPosition && (
                            <div 
                              className={styles.dropdown}
                              style={{
                                top: `${menuPosition.top}px`,
                                left: `${menuPosition.left}px`,
                                transform: menuPosition.transform,
                              }}
                            >
                              <button
                                className={styles.dropdownItem}
                                onClick={() =>
                                  updateApplicationStatus(
                                    app.id,
                                    "awaiting_nomination"
                                  )
                                }
                              >
                                Mark Awaiting Nomination
                              </button>
                              <button
                                className={styles.dropdownItem}
                                onClick={() =>
                                  updateApplicationStatus(app.id, "nominated")
                                }
                              >
                                Nominate Student
                              </button>
                              <button
                                className={styles.dropdownItem}
                                onClick={() =>
                                  updateApplicationStatus(
                                    app.id,
                                    "session_booked"
                                  )
                                }
                              >
                                Mark Session Booked
                              </button>
                              <button
                                className={styles.dropdownItem}
                                onClick={() =>
                                  updateApplicationStatus(
                                    app.id,
                                    "session_completed"
                                  )
                                }
                              >
                                Complete Session
                              </button>
                              <button
                                className={styles.dropdownItem}
                                onClick={() =>
                                  updateApplicationStatus(app.id, "approved")
                                }
                              >
                                Approve Application
                              </button>
                              <div className={styles.dropdownDivider} />
                              <button
                                className={styles.dropdownItem}
                                onClick={() => handleDownloadPDF(app.id)}
                              >
                                Download Report
                              </button>
                              <button
                                className={styles.dropdownItem}
                                onClick={() => alert("Assign feature coming soon!")}
                              >
                                Assign to Advisor
                              </button>
                              <div className={styles.dropdownDivider} />
                              <button
                                className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`}
                                onClick={() => deleteApplication(app.id)}
                              >
                                Delete Application
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {selectedApp && (
        <div className={styles.modal} onClick={() => setSelectedApp(null)}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Application Details</h2>
              <button
                className={styles.closeButton}
                onClick={() => setSelectedApp(null)}
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.detailSection}>
                <h3 className={styles.detailSectionTitle}>Student Information</h3>
                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Full Name</span>
                    <span className={styles.detailValue}>
                      {selectedApp.studentName}
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Student ID</span>
                    <span className={styles.detailValue}>
                      {selectedApp.studentId}
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Email</span>
                    <span className={styles.detailValue}>
                      {selectedApp.studentEmail}
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Nationality</span>
                    <span className={styles.detailValue}>
                      {selectedApp.studentNationality}
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>College</span>
                    <span className={styles.detailValue}>
                      {selectedApp.studentCollege}
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Major</span>
                    <span className={styles.detailValue}>
                      {selectedApp.studentMajor}
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>CGPA</span>
                    <span className={styles.detailValue}>
                      {selectedApp.studentCGPA}
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Status</span>
                    <span className={getStatusClassName(selectedApp.status)}>
                      {STATUS_LABELS[selectedApp.status]}
                    </span>
                  </div>
                </div>
                {selectedApp.personalStatement && (
                  <div style={{ marginTop: "16px" }}>
                    <span className={styles.detailLabel}>Personal Statement</span>
                    <p style={{ marginTop: "8px", lineHeight: "1.6" }}>
                      {selectedApp.personalStatement}
                    </p>
                  </div>
                )}
              </div>

              <div className={styles.detailSection}>
                <h3 className={styles.detailSectionTitle}>Destination</h3>
                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Country</span>
                    <span className={styles.detailValue}>
                      {selectedApp.country}
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>University</span>
                    <span className={styles.detailValue}>
                      {selectedApp.university}
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Submitted</span>
                    <span className={styles.detailValue}>
                      {formatDate(selectedApp.submittedAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.detailSection}>
                <h3 className={styles.detailSectionTitle}>
                  Course Evaluations ({selectedApp.courses.length})
                </h3>
                <div className={styles.coursesList}>
                  {selectedApp.courses.map((course, idx) => (
                    <div key={idx} className={styles.courseItem}>
                      <div className={styles.courseInfo}>
                        <div className={styles.courseCode}>{course.code}</div>
                        {course.hostCourseTitle && (
                          <div className={styles.courseHost}>
                            {course.hostCourseTitle}
                          </div>
                        )}
                        <div className={styles.courseMessage}>
                          {course.message}
                        </div>
                        {course.notes && (
                          <div className={styles.courseMessage}>
                            Note: {course.notes}
                          </div>
                        )}
                      </div>
                      <span className={getCourseStatusClassName(course.status)}>
                        {course.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.detailSection}>
                <h3 className={styles.detailSectionTitle}>
                  Admin Comments ({selectedApp.adminComments?.length || 0})
                </h3>
                
                <div className={styles.commentsLayout}>
                  <div className={styles.commentsContent}>
                    {selectedApp.adminComments && selectedApp.adminComments.length > 0 ? (
                      <>
                        {["step_0", "step_1", "step_2", "step_3", "success_page"].map((page) => {
                          const pageComments = selectedApp.adminComments?.filter((c) => c.page === page) || [];
                          if (pageComments.length === 0) return null;
                          
                          const pageLabels = {
                            step_0: "Step 1: Student Profile",
                            step_1: "Step 2: Destination",
                            step_2: "Step 3: Course Mapping",
                            step_3: "Step 4: Review",
                            success_page: "Success Page"
                          };
                          
                          return (
                            <div key={page} className={styles.commentSection}>
                              <h4 className={styles.commentSectionTitle}>{pageLabels[page as keyof typeof pageLabels]}</h4>
                              <div className={styles.commentsList}>
                                {pageComments.map((comment) => (
                                  <div key={comment.id} className={styles.commentItem}>
                                    <div className={styles.commentHeader}>
                                      <span className={styles.commentType}>
                                        {comment.type === "note" && "Note"}
                                        {comment.type === "document_request" && "Document Request"}
                                        {comment.type === "process_update" && "Process Update"}
                                      </span>
                                      <span className={styles.commentMeta}>
                                        {new Date(comment.createdAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                    <div className={styles.commentMessage}>{comment.message}</div>
                                    <div className={styles.commentAuthor}>— {comment.createdBy}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </>
                    ) : (
                      <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
                        No comments yet. Use the panel on the right to add comments.
                      </p>
                    )}
                  </div>
                  
                  <div className={styles.commentSidebar}>
                    <div className={styles.sidebarHeader}>
                      <div className={styles.sidebarTitle}>Add Comment</div>
                      <div className={styles.sidebarAuthor}>{adminEmail || "Admin"}</div>
                    </div>
                    
                    <div className={styles.sidebarContent}>
                      <div className={styles.sidebarField}>
                        <label>Page/Step</label>
                        <select
                          className={styles.sidebarSelect}
                          value={commentPage}
                          onChange={(e) => setCommentPage(e.target.value as any)}
                        >
                          <option value="step_0">Step 1: Student Profile</option>
                          <option value="step_1">Step 2: Destination</option>
                          <option value="step_2">Step 3: Course Mapping</option>
                          <option value="step_3">Step 4: Review</option>
                          <option value="success_page">Success Page</option>
                        </select>
                      </div>
                      
                      <div className={styles.sidebarField}>
                        <label>Type</label>
                        <select
                          className={styles.sidebarSelect}
                          value={commentType}
                          onChange={(e) => setCommentType(e.target.value as any)}
                        >
                          <option value="note">Note</option>
                          <option value="document_request">Document Request</option>
                          <option value="process_update">Process Update</option>
                        </select>
                      </div>
                      
                      <div className={styles.sidebarField}>
                        <label>Message</label>
                        <textarea
                          className={styles.sidebarTextarea}
                          value={commentMessage}
                          onChange={(e) => setCommentMessage(e.target.value)}
                          placeholder="Enter your message to the student..."
                          rows={8}
                        />
                      </div>
                      
                      <button
                        className={styles.sidebarButton}
                        onClick={handleAddComment}
                        disabled={isSubmittingComment || !commentMessage.trim()}
                      >
                        {isSubmittingComment ? "Adding..." : "Add Comment"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.modalActions}>
                <button
                  className={styles.downloadButton}
                  onClick={() => handleDownloadPDF(selectedApp.id)}
                >
                  Download Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {openMenuId && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 999,
          }}
          onClick={() => {
            setOpenMenuId(null);
            setMenuPosition(null);
          }}
        />
      )}
    </div>
  );
}