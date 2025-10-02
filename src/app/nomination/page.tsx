"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import confetti from "canvas-confetti";
import styles from "./page.module.css";

type NominationState = "confirmation" | "waiting" | "approved";

function NominationPageContent() {
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("id");
  const approvedCount = parseInt(searchParams.get("approved") || "0");
  const [state, setState] = useState<NominationState>("confirmation");

  const handleSubmitNomination = async () => {
    if (approvedCount < 3) {
      if (!confirm(`You only have ${approvedCount} approved courses. Most exchanges require at least 3. Continue anyway?`)) {
        return;
      }
    }

    setState("waiting");

    // TODO: Submit nomination request to API
    try {
      await fetch(`/api/admin/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "awaiting_nomination" }),
      });

      // Poll for approval status
      pollForApproval();
    } catch (error) {
      console.error("Failed to submit nomination:", error);
      alert("Failed to submit nomination request. Please try again.");
      setState("confirmation");
    }
  };

  const pollForApproval = () => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/applications/${applicationId}/status`);
        if (response.ok) {
          const data = await response.json();
          if (data.status === "nominated" || data.status === "approved") {
            clearInterval(interval);
            setState("approved");
            triggerConfetti();
          }
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 3000); // Poll every 3 seconds

    // Cleanup after 5 minutes
    setTimeout(() => clearInterval(interval), 300000);
  };

  const triggerConfetti = () => {
    const duration = 2500;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 7,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: ['#10b981', '#fbbf24', '#3b82f6', '#ec4899'],
      });
      confetti({
        particleCount: 7,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: ['#10b981', '#fbbf24', '#3b82f6', '#ec4899'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  };

  const renderConfirmation = () => (
    <>
      <h1 className={styles.title}>Submit for Nomination</h1>
      <p className={styles.subtitle}>
        You&apos;re about to submit your nomination request to the OIAA team.
      </p>

      <div className={styles.courseCount}>{approvedCount}</div>
      <p className={styles.subtitle}>
        Approved Course{approvedCount !== 1 ? 's' : ''}
      </p>

      {approvedCount < 3 ? (
        <div className={styles.warningBox}>
          <h3 className={styles.warningTitle}>Limited Approvals</h3>
          <p className={styles.warningText}>
            You have fewer than 3 approved courses. Most exchange programs require at least 3 approved courses for nomination. We recommend booking an advising session to explore additional options.
          </p>
        </div>
      ) : (
        <div className={styles.infoBox}>
          <p className={styles.infoText}>
            You meet the minimum requirement of 3 approved courses. Once you submit, our team will review your nomination request and notify you of the decision.
          </p>
        </div>
      )}

      <div className={styles.buttonGroup}>
        <button
          className={styles.secondaryButton}
          onClick={() => window.history.back()}
        >
          Go Back
        </button>
        <button
          className={styles.primaryButton}
          onClick={handleSubmitNomination}
        >
          Confirm & Submit
        </button>
      </div>
    </>
  );

  const renderWaiting = () => (
    <>
      <h1 className={styles.title}>Nomination Submitted</h1>
      <div className={styles.statusPill}>
        <span className={styles.pulsingDot} />
        Application Under Review
      </div>
      <p className={styles.subtitle}>
        Your nomination request has been sent to the OIAA team. Please wait while we review your application...
      </p>
      <div className={styles.infoBox}>
        <p className={styles.infoText}>
          This page will automatically update when your nomination is approved. You can safely close this page and return later - we&apos;ll send you an email notification.
        </p>
      </div>
    </>
  );

  const renderApproved = () => (
    <>
      <h1 className={styles.successTitle}>
        Congratulations!
      </h1>
      <div className={`${styles.statusPill} ${styles.approved}`}>
        Nomination Approved
      </div>
      <p className={styles.successMessage}>
        Your nomination has been <strong>approved</strong>! You&apos;re one step closer to your exchange journey.
      </p>
      <div className={styles.infoBox}>
        <p className={styles.infoText}>
          Check your email for detailed next steps and required documentation. Our team will be in touch shortly to guide you through the remaining process.
        </p>
      </div>
      <button
        className={styles.primaryButton}
        onClick={() => window.location.href = "/"}
      >
        Return to Home
      </button>
    </>
  );

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
        <div className={styles.card}>
          {state === "confirmation" && renderConfirmation()}
          {state === "waiting" && renderWaiting()}
          {state === "approved" && renderApproved()}
        </div>
      </main>
    </div>
  );
}

export default function NominationPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NominationPageContent />
    </Suspense>
  );
}
