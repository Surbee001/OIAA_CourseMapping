"use client";

import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import styles from "./StepTimeline.module.css";

interface Step {
  id: number;
  title: string;
  completed: boolean;
}

interface StepTimelineProps {
  steps: Step[];
  currentStep: number;
  onStepClick: (stepIndex: number) => void;
  draftId?: string | null;
  applicationSubmitted?: boolean;
}

export function StepTimeline({ steps, currentStep, onStepClick, draftId, applicationSubmitted = false }: StepTimelineProps) {
  return (
    <div className={styles.timeline}>
      <div className={styles.timelineHeader}>
        <h3 className={styles.timelineTitle}>Progress</h3>
        <span className={styles.timelineCount}>
          {steps.filter(s => s.completed).length} of {steps.length}
        </span>
      </div>
      
      <div className={styles.stepsList}>
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = step.completed;
          const isClickable = isCompleted || index < currentStep;
          
          return (
            <motion.div
              key={step.id}
              className={`${styles.stepItem} ${isActive ? styles.stepItemActive : ""} ${
                isCompleted ? styles.stepItemCompleted : ""
              } ${isClickable ? styles.stepItemClickable : ""}`}
              onClick={() => isClickable && onStepClick(index)}
              whileHover={isClickable ? { x: 4 } : {}}
              transition={{ duration: 0.2 }}
            >
              <div className={styles.stepIndicator}>
                <div className={styles.stepNumber}>
                  {isCompleted ? (
                    <span className={styles.checkmark}>✓</span>
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`${styles.stepLine} ${isCompleted ? styles.stepLineCompleted : ""}`} />
                )}
              </div>
              
              <div className={styles.stepContent}>
                <div className={styles.stepTitle}>{step.title}</div>
                <div className={styles.stepStatus}>
                  {isActive ? "In Progress" : isCompleted ? "Completed" : "Not Started"}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {draftId && (
        <div className={styles.quickLinks}>
          <div className={styles.quickLinksHeader}>Quick Access</div>
          {applicationSubmitted ? (
            <a 
              href={`/status?id=${draftId}`}
              className={styles.quickLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>Check Application Status</span>
              <ExternalLink size={14} />
            </a>
          ) : (
            <div className={`${styles.quickLink} ${styles.quickLinkDisabled}`}>
              <span>Check Application Status</span>
            </div>
          )}
          <a 
            href="https://calendly.com/ayesha-alfalasi-ajman/30min"
            className={styles.quickLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>Book Advising Session</span>
            <ExternalLink size={14} />
          </a>
        </div>
      )}
    </div>
  );
}

