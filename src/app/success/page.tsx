"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import styles from "./page.module.css";

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("id");
  const approvedCount = parseInt(searchParams.get("approved") || "0");
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    setShowWarning(approvedCount < 3);
  }, [approvedCount]);

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
        <div className={styles.successCard}>
          <div className={styles.checkmark}>
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className={styles.successTitle}>Application Submitted!</h1>
          <p className={styles.successMessage}>
            We&apos;ve received your exchange application and will review it shortly. Your application ID is <strong>{applicationId}</strong>.
          </p>
        </div>

        <div className={styles.nextStepsCard}>
          <h2 className={styles.nextStepsTitle}>What happens next?</h2>
          <ul className={styles.stepsList}>
            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <span className={styles.stepContent}>
                Our team will review your course selections and university match within 2-3 business days.
              </span>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <span className={styles.stepContent}>
                You&apos;ll receive an email confirmation once your application is processed.
              </span>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <span className={styles.stepContent}>
                Choose one of the options below to proceed with your exchange journey.
              </span>
            </li>
          </ul>

          <div className={styles.buttonGroup}>
            <a
              href="https://calendly.com/ayesha-alfalasi-ajman/30min"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.primaryButton}
            >
              Book Advising Session
            </a>
            <a
              href={`/nomination?id=${applicationId}&approved=${approvedCount}`}
              className={styles.secondaryButton}
            >
              Apply for Nomination
            </a>
          </div>

          <div className={styles.statusCheckNote}>
            <p>
              You can check your application status anytime at{" "}
              <a href={`/status?id=${applicationId}`} className={styles.statusLink}>
                /status
              </a>
            </p>
          </div>

          {showWarning && (
            <div className={styles.warningNote}>
              Note: You have {approvedCount} approved course{approvedCount !== 1 ? 's' : ''}. Nomination typically requires at least 3 approved courses. We recommend booking an advising session to discuss your options.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessPageContent />
    </Suspense>
  );
}
