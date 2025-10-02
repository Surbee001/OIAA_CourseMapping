"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import styles from "./page.module.css";
import { Application, AdminComment } from "@/types/application";

function StatusPageContent() {
  const searchParams = useSearchParams();
  const idFromUrl = searchParams.get("id");
  
  const [applicationId, setApplicationId] = useState(idFromUrl || "");
  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicationId.trim()) return;

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/applications/${applicationId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Application not found. Please check your application ID.");
        }
        throw new Error("Failed to fetch application status.");
      }

      const data = await response.json();
      setApplication(data.application);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setApplication(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: "Draft",
      submitted: "Submitted",
      awaiting_nomination: "Awaiting Nomination",
      nominated: "Nominated",
      session_booked: "Session Booked",
      session_completed: "Session Completed",
      approved: "Approved",
      rejected: "Rejected",
    };
    return labels[status] || status;
  };

  const getCommentTypeIcon = (type: string) => {
    // Icons removed for professional appearance
    return "";
  };

  const getCommentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      note: "Note",
      document_request: "Document Request",
      process_update: "Process Update",
    };
    return labels[type] || type;
  };

  const getPageLabel = (page: string) => {
    const labels: Record<string, string> = {
      step_0: "Step 1: Student Profile",
      step_1: "Step 2: Destination",
      step_2: "Step 3: Course Mapping",
      step_3: "Step 4: Review",
      success_page: "Success Page",
    };
    return labels[page] || page;
  };

  return (
    <div className={styles.shell}>
      <header className={styles.topBar}>
        <img
          src="https://github.com/Surbee001/webimg/blob/main/Artboard%201.png?raw=true"
          alt="Office of International Academic Affairs"
          className={styles.logo}
        />
      </header>

      <main className={styles.main}>
        <div className={styles.header}>
          <h1>Check Application Status</h1>
          <p>Enter your application ID to view your status and any messages from our team</p>
        </div>

        <form onSubmit={handleCheckStatus} className={styles.searchCard}>
          <div className={styles.inputGroup}>
            <input
              type="text"
              className={styles.input}
              placeholder="Enter your application ID (e.g., abc123def456)"
              value={applicationId}
              onChange={(e) => setApplicationId(e.target.value)}
            />
            <button 
              type="submit" 
              className={styles.searchButton}
              disabled={isLoading || !applicationId.trim()}
            >
              {isLoading ? "Checking..." : "Check Status"}
            </button>
          </div>
        </form>

        {error && (
          <div className={styles.errorCard}>
            <p>{error}</p>
          </div>
        )}

        {application && (
          <div className={styles.resultsContainer}>
            <div className={styles.statusCard}>
              <div className={styles.statusHeader}>
                <h2>Application Status</h2>
                <span className={`${styles.statusBadge} ${styles[`status${application.status}`]}`}>
                  {getStatusLabel(application.status)}
                </span>
              </div>
              <div className={styles.statusDetails}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Application ID</span>
                  <span className={styles.detailValue}>{application.id}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Destination</span>
                  <span className={styles.detailValue}>{application.university}, {application.country}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Submitted</span>
                  <span className={styles.detailValue}>
                    {new Date(application.submittedAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
              </div>
            </div>

            {application.adminComments && application.adminComments.length > 0 && (
              <div className={styles.commentsCard}>
                <h3>Messages from OIAA Team</h3>
                <div className={styles.commentsList}>
                  {application.adminComments.map((comment: AdminComment) => (
                    <div key={comment.id} className={styles.commentItem}>
                      <div className={styles.commentHeader}>
                        <div>
                          <span className={styles.commentType}>
                            {getCommentTypeLabel(comment.type)}
                          </span>
                          <span className={styles.commentPage}>
                            • {getPageLabel(comment.page)}
                          </span>
                        </div>
                        <span className={styles.commentDate}>
                          {new Date(comment.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <p className={styles.commentMessage}>{comment.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className={styles.actionsCard}>
              <h3>Next Steps</h3>
              <p>Based on your application status, here are your options:</p>
              <div className={styles.actionButtons}>
                <a
                  href="https://calendly.com/ayesha-alfalasi-ajman/30min"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.primaryButton}
                >
                  Book Advising Session
                </a>
                <a
                  href={`mailto:international@ajman.ac.ae?subject=Application ${application.id}`}
                  className={styles.secondaryButton}
                >
                  Contact OIAA
                </a>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function StatusPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <StatusPageContent />
    </Suspense>
  );
}

