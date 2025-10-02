"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import {
  evaluateCourseCodes,
  listCountries,
  listUniversities,
  summariseEligibility,
  recommendUniversities,
  type EvaluatedCourse,
  type UniversityRecommendation,
} from "@/lib/courseCatalog";
import { sampleCourseMappings, getSampleCourseMappings, type CourseMappingRow } from "@/data/sampleCourseMappings";
import type { CourseEvaluation } from "@/types/application";
import { StepTimeline } from "./StepTimeline";
import styles from "./CourseMappingWizard.module.css";

const steps = [
  {
    id: 0,
    title: "Student profile",
    caption: "Let us know who is applying",
  },
  {
    id: 1,
    title: "Destination",
    caption: "Pick your country and partner",
  },
  {
    id: 2,
    title: "Course mapping",
    caption: "Tell us what you plan to take",
  },
  {
    id: 3,
    title: "Review",
    caption: "Confirm eligibility and submit",
  },
] as const;

const heroTitles = [
  "Who is starting the application?",
  "Where do you want to study?",
  "Which courses matter next term?",
  "Ready to review your matches?",
];

const heroDescriptions = [
  "We use your details to personalise the application packet for advisors.",
  "Choose a country and we will reveal the partners you can apply to.",
  "List the course codes you must complete next semester so we can compare them instantly.",
  "We summarise approvals and flag anything that needs a follow-up conversation.",
];

const DEFAULT_COURSE_FIELDS = 3;

const stepPaths = steps.map((_, index) => `/step-${index + 1}`);
const stepPathPattern = /^\/step-(\d+)$/i;

const clampStepIndex = (value: number) => Math.min(Math.max(value, 0), steps.length - 1);

const pathToStepIndex = (pathname: string) => {
  const match = stepPathPattern.exec(pathname);
  if (!match) {
    return 0;
  }

  const parsed = Number.parseInt(match[1], 10) - 1;
  if (Number.isNaN(parsed)) {
    return 0;
  }

  return clampStepIndex(parsed);
};

interface CourseMappingWizardProps {
  initialStep?: number;
}

export function CourseMappingWizard({ initialStep = 0 }: CourseMappingWizardProps) {
  const [catalogRows, setCatalogRows] = useState<CourseMappingRow[]>(sampleCourseMappings);
  const [, setIsLoadingData] = useState(true);
  const cardBodyRef = useRef<HTMLDivElement>(null);
  const normalizedInitialStep = clampStepIndex(initialStep);
  const [currentStep, setCurrentStep] = useState<number>(normalizedInitialStep);
  const hasHydratedRef = useRef(false);
  const skipHistoryUpdateRef = useRef(false);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [isLoadingDraft, setIsLoadingDraft] = useState(true);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  useEffect(() => {
    const loadExcelData = async () => {
      try {
        const data = await getSampleCourseMappings();
        setCatalogRows(data);
      } catch (error) {
        console.error('Failed to load Excel data, using fallback:', error);
        setCatalogRows(sampleCourseMappings);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadExcelData();
  }, []);

  // Load draft from URL
  useEffect(() => {
    const loadDraft = async () => {
      const params = new URLSearchParams(window.location.search);
      const id = params.get('draft');
      
      if (id) {
        try {
          const response = await fetch(`/api/applications/draft?id=${id}`);
          if (response.ok) {
            const data = await response.json();
            const draft = data.draft;
            
            // Restore draft data
            setDraftId(id);
            if (draft.studentName) setStudentName(draft.studentName);
            if (draft.studentId) setStudentId(draft.studentId);
            if (draft.studentEmail) setStudentEmail(draft.studentEmail);
            if (draft.studentNationality) setStudentNationality(draft.studentNationality);
            if (draft.studentCollege) setStudentCollege(draft.studentCollege);
            if (draft.studentMajor) setStudentMajor(draft.studentMajor);
            if (draft.studentCGPA) setStudentCGPA(draft.studentCGPA);
            if (draft.personalStatement) setPersonalStatement(draft.personalStatement);
            if (draft.country) setSelectedCountry(draft.country);
            if (draft.university) setSelectedUniversity(draft.university);
            if (draft.courses && draft.courses.length > 0) {
              setCourseInputs(draft.courses.map((c: CourseEvaluation) => c.code));
            }
            
            // Mark step 0 as completed if we have student data
            if (draft.studentName) {
              setCompletedSteps(new Set([0]));
            }
          } else if (response.status === 404) {
            // Draft not found - might be submitted. Check if it's a submitted application
            try {
              const statusResponse = await fetch(`/api/applications/${id}/status`);
              if (statusResponse.ok) {
                // Application exists but is submitted, redirect to status page
                window.location.href = `/status?id=${id}`;
                return;
              }
            } catch {
              // If status check fails, just continue with empty form
              console.log('Draft not found, starting fresh application');
            }
          }
        } catch (error) {
          console.error('Failed to load draft:', error);
        }
      }
      setIsLoadingDraft(false);
    };

    loadDraft();
  }, []);

  const countries = useMemo(() => listCountries(catalogRows), [catalogRows]);

  useEffect(() => {
    setCurrentStep((previous) => {
      const next = clampStepIndex(initialStep);
      return previous === next ? previous : next;
    });
  }, [initialStep]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handlePopState = (event: PopStateEvent) => {
      const stateStep = typeof event.state?.step === "number" ? clampStepIndex(event.state.step) : null;
      const next = stateStep ?? pathToStepIndex(window.location.pathname);

      if (next === null || next === undefined) {
        return;
      }

      skipHistoryUpdateRef.current = true;
      setCurrentStep((previous) => (previous === next ? previous : next));
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const targetPath = stepPaths[currentStep] ?? `/step-${currentStep + 1}`;

    if (!hasHydratedRef.current) {
      hasHydratedRef.current = true;
      window.history.replaceState({ step: currentStep }, "", targetPath);
      return;
    }

    if (skipHistoryUpdateRef.current) {
      skipHistoryUpdateRef.current = false;
      window.history.replaceState({ step: currentStep }, "", targetPath);
      return;
    }

    if (window.location.pathname !== targetPath) {
      window.history.pushState({ step: currentStep }, "", targetPath);
    } else {
      window.history.replaceState({ step: currentStep }, "", targetPath);
    }
  }, [currentStep]);

  const [studentName, setStudentName] = useState<string>("");
  const [studentId, setStudentId] = useState<string>("");
  const [studentEmail, setStudentEmail] = useState<string>("");
  const [studentNationality, setStudentNationality] = useState<string>("");
  const [studentCollege, setStudentCollege] = useState<string>("");
  const [studentMajor, setStudentMajor] = useState<string>("");
  const [studentCGPA, setStudentCGPA] = useState<string>("");
  const [personalStatement, setPersonalStatement] = useState<string>("");

  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const universities = useMemo(
    () => (selectedCountry ? listUniversities(catalogRows, selectedCountry) : []),
    [catalogRows, selectedCountry]
  );
  const [selectedUniversity, setSelectedUniversity] = useState<string>("");
  const [wantsRecommendations, setWantsRecommendations] = useState<boolean>(false);
  const [recommendations, setRecommendations] = useState<UniversityRecommendation[]>([]);

  const [courseInputs, setCourseInputs] = useState<string[]>(
    Array.from({ length: DEFAULT_COURSE_FIELDS }, () => "")
  );
  const [evaluatedCourses, setEvaluatedCourses] = useState<EvaluatedCourse[]>([]);
  const [summary, setSummary] = useState(() => summariseEligibility([]));

  const [submissionState, setSubmissionState] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const populateMockData = () => {
    // Set student profile data
    setStudentName("Sarah Al-Rashid");
    setStudentId("202145678");
    setStudentEmail("sarah.alrashid@ajmanuni.ac.ae");
    setStudentNationality("United Arab Emirates");
    setStudentCollege("College of Business Administration");
    setStudentMajor("International Business");
    setStudentCGPA("3.65");
    setPersonalStatement("Dean's List recipient for 3 consecutive semesters. Active member of the International Student Exchange Club and Business Analytics Society.");

    // Set destination data
    setSelectedCountry("United States");
    setSelectedUniversity("University of South Carolina");

    // Set course codes to show different statuses
    setCourseInputs([
      "MGT400",  // Should be approved based on Excel
      "ECO200",  // Should show another status
      "FIN210",  // Test case
      "MGT200",  // Test case
      "ABC999",  // Invalid/missing course
      ""         // Keep one empty for flexibility
    ]);
  };

  const nonEmptyCourseCodes = courseInputs.filter((code) => code.trim().length > 0);

  const canAdvance = useMemo(() => {
    switch (currentStep) {
      case 0:
        return studentName.trim().length > 1 &&
               studentId.trim().length > 0 &&
               studentEmail.toLowerCase().endsWith("@ajmanuni.ac.ae") &&
               studentNationality.trim().length > 0 &&
               studentCollege.trim().length > 0 &&
               studentMajor.trim().length > 0 &&
               studentCGPA.trim().length > 0 &&
               !isNaN(parseFloat(studentCGPA)) &&
               parseFloat(studentCGPA) >= 0 &&
               parseFloat(studentCGPA) <= 4.0;
      case 1:
        // Allow advancing if: (country AND university selected) OR recommendations enabled
        return (selectedCountry && selectedUniversity) || wantsRecommendations;
      case 2:
        return nonEmptyCourseCodes.length > 0;
      case 3:
        return true;
      default:
        return false;
    }
  }, [currentStep, studentName, studentId, studentEmail, studentNationality, studentCollege, studentMajor, studentCGPA, selectedCountry, selectedUniversity, wantsRecommendations, nonEmptyCourseCodes]);

  const heroTitle = heroTitles[currentStep] || heroTitles[0];
  const heroCopy = heroDescriptions[currentStep] || heroDescriptions[0];
  const progressLabel = `${currentStep + 1} of ${steps.length}`;

  const saveDraft = async () => {
    try {
      const draftData = {
        id: draftId || undefined,
        studentName,
        studentId,
        studentEmail,
        studentNationality,
        studentCollege,
        studentMajor,
        studentCGPA,
        personalStatement,
        country: selectedCountry,
        university: selectedUniversity,
        courses: evaluatedCourses.length > 0 ? evaluatedCourses.map((course) => ({
          code: course.normalizedCode,
          status: course.status,
          hostCourseTitle: course.mapping?.hostCourseTitle,
          message: course.message,
          notes: course.mapping?.notes,
        })) : undefined,
        currentStep,
      };

      const response = await fetch("/api/applications/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draftData),
      });

      if (response.ok) {
        const data = await response.json();
        const newDraftId = data.draftId;
        
        if (!draftId && newDraftId) {
          setDraftId(newDraftId);
          // Update URL with draft ID
          const url = new URL(window.location.href);
          url.searchParams.set('draft', newDraftId);
          window.history.replaceState({}, '', url);
        }
        
        return true;
      }
    } catch (error) {
      console.error("Failed to save draft:", error);
    }
    return false;
  };

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      // Mark current step as completed
      const newCompleted = new Set(completedSteps);
      newCompleted.add(currentStep);
      setCompletedSteps(newCompleted);
      
      // Save draft after completing step 0
      if (currentStep === 0) {
        await saveDraft();
      }
      
      setCurrentStep(currentStep + 1);
      
      // Save draft for other steps too
      if (currentStep > 0) {
        await saveDraft();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleTimelineClick = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  const handleCourseChange = (index: number, value: string) => {
    const updated = [...courseInputs];
    updated[index] = value;
    setCourseInputs(updated);
  };

  const handleCourseFocus = () => {
    // Auto-expand course fields when focused
    if (courseInputs.every(input => input.trim() === "")) {
      return;
    }
    if (courseInputs.filter(input => input.trim() !== "").length >= courseInputs.length) {
      setCourseInputs([...courseInputs, ""]);
    }
  };

  const handleAddCourseField = () => {
    setCourseInputs([...courseInputs, ""]);
  };

  const handleCountrySelect = (country: string) => {
    setSelectedCountry(country);
    setSelectedUniversity("");
    setRecommendations([]);
  };

  const handleUniversitySelect = (university: string) => {
    setSelectedUniversity(university);
  };

  const handleRecommendationMode = (enabled: boolean) => {
    setWantsRecommendations(enabled);
    if (enabled) {
      setSelectedUniversity("");
    }
  };

  useEffect(() => {
    if (cardBodyRef.current) {
      cardBodyRef.current.scrollTop = 0;
    }
  }, [currentStep]);

  // Evaluate courses when step 2 is active and courses are entered
  useEffect(() => {
    if (currentStep === 2 && nonEmptyCourseCodes.length > 0 && selectedUniversity) {
      const evaluated = evaluateCourseCodes(nonEmptyCourseCodes, catalogRows, {
        country: selectedCountry,
        university: selectedUniversity,
      });
      setEvaluatedCourses(evaluated);
    } else if (currentStep === 3 && nonEmptyCourseCodes.length > 0 && selectedUniversity) {
      const evaluated = evaluateCourseCodes(nonEmptyCourseCodes, catalogRows, {
        country: selectedCountry,
        university: selectedUniversity,
      });
      setEvaluatedCourses(evaluated);
    }
  }, [currentStep, nonEmptyCourseCodes, selectedUniversity, selectedCountry, catalogRows]);

  // Generate recommendations when in recommendation mode and courses are entered
  useEffect(() => {
    if (wantsRecommendations && currentStep >= 2 && nonEmptyCourseCodes.length > 0) {
      const recs = recommendUniversities(nonEmptyCourseCodes, catalogRows, { limit: 10 });
      setRecommendations(recs);
    } else if (!wantsRecommendations) {
      setRecommendations([]);
    }
  }, [wantsRecommendations, currentStep, nonEmptyCourseCodes, catalogRows]);

  // Update summary when evaluated courses change
  useEffect(() => {
    if (evaluatedCourses.length > 0) {
      setSummary(summariseEligibility(evaluatedCourses));
    }
  }, [evaluatedCourses]);

  const handleSubmitApplication = async () => {
    if (submissionState === "submitting") return;

    setSubmissionState("submitting");
    setSubmissionError(null);

    try {
      const payload = {
        studentName,
        studentId,
        studentEmail,
        studentNationality,
        studentCollege,
        studentMajor,
        studentCGPA,
        personalStatement: personalStatement || undefined,
        country: selectedCountry,
        university: selectedUniversity,
        courses: evaluatedCourses.map((course) => ({
          code: course.normalizedCode,
          status: course.status,
          hostCourseTitle: course.mapping?.hostCourseTitle,
          message: course.message,
          notes: course.mapping?.notes,
        })),
        allApproved: summary.allApproved,
      };

      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Submission failed");
      }

      const responseData = await response.json();
      
      // Redirect to success page with application data
      const approvedCount = summary.approvedCount;
      window.location.href = `/success?id=${responseData.applicationId}&approved=${approvedCount}`;
    } catch (error) {
      console.error("Submission error:", error);
      setSubmissionError(
        error instanceof Error ? error.message : "Failed to submit application"
      );
      setSubmissionState("error");
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className={styles.formGrid}>
            <div className={styles.fieldGroup}>
              <label htmlFor="studentName">Full name</label>
              <input
                id="studentName"
                className={styles.input}
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Enter your full name"
                maxLength={100}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="studentId">Student ID</label>
              <input
                id="studentId"
                className={styles.input}
                value={studentId}
                onChange={(e) => {
                  const id = e.target.value;
                  setStudentId(id);
                  // Auto-generate email from ID
                  if (id.trim()) {
                    setStudentEmail(`${id.trim()}@ajmanuni.ac.ae`);
                  } else {
                    setStudentEmail("");
                  }
                }}
                placeholder="e.g. 202145678"
                maxLength={50}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="studentEmail">Email address</label>
              <input
                id="studentEmail"
                className={styles.input}
                type="email"
                value={studentEmail}
                readOnly
                disabled
                style={{ background: "var(--surface-subtle)", cursor: "not-allowed" }}
                placeholder="Auto-generated from Student ID"
              />
              <span className={styles.helper}>
                Email is auto-generated from your Student ID
              </span>
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="studentNationality">Nationality</label>
              <input
                id="studentNationality"
                className={styles.input}
                value={studentNationality}
                onChange={(e) => setStudentNationality(e.target.value)}
                placeholder="e.g. United Arab Emirates"
                maxLength={100}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="studentCollege">College</label>
              <input
                id="studentCollege"
                className={styles.input}
                value={studentCollege}
                onChange={(e) => setStudentCollege(e.target.value)}
                placeholder="e.g. College of Business Administration"
                maxLength={200}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="studentMajor">Major</label>
              <input
                id="studentMajor"
                className={styles.input}
                value={studentMajor}
                onChange={(e) => setStudentMajor(e.target.value)}
                placeholder="e.g. International Business"
                maxLength={200}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="studentCGPA">Current CGPA</label>
              <input
                id="studentCGPA"
                className={styles.input}
                type="number"
                step="0.01"
                min="0"
                max="4.0"
                value={studentCGPA}
                onChange={(e) => setStudentCGPA(e.target.value)}
                placeholder="e.g. 3.65"
              />
            </div>

            <div className={styles.fieldGroupFull}>
              <label htmlFor="personalStatement">Personal statement (optional)</label>
              <textarea
                id="personalStatement"
                className={styles.textarea}
                value={personalStatement}
                onChange={(e) => setPersonalStatement(e.target.value)}
                placeholder="Tell us about your academic achievements, extracurricular activities, or reasons for studying abroad..."
                rows={4}
                maxLength={2000}
              />
              <div className={styles.personalStatementHelp}>
                <small>This information helps us personalize your application and may be shared with partner universities.</small>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className={styles.formGrid}>
            <div className={styles.fieldGroup}>
              <label htmlFor="country">Destination country</label>
              <div className={styles.selectWrapper}>
                <select
                  id="country"
                  className={styles.select}
                  value={selectedCountry}
                  disabled={wantsRecommendations}
                  onChange={(event) => handleCountrySelect(event.target.value)}
                >
                  <option value="">Select a country</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
                <ChevronDown className={styles.selectIcon} size={20} />
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="university">Partner university</label>
              <div className={styles.selectWrapper}>
                <select
                  id="university"
                  className={styles.select}
                  value={selectedUniversity}
                  onChange={(event) => handleUniversitySelect(event.target.value)}
                  disabled={!selectedCountry || wantsRecommendations}
                >
                  <option value="">
                    {selectedCountry ? "Select a university" : "Choose a country first"}
                  </option>
                  {universities.map((university) => (
                    <option key={university} value={university}>
                      {university}
                    </option>
                  ))}
                </select>
                <ChevronDown className={styles.selectIcon} size={20} />
              </div>
              <span className={styles.helper}>
                {wantsRecommendations
                  ? "Smart recommendations enabled. We'll analyse all partners based on your course list."
                  : selectedCountry
                  ? `Showing ${universities.length} partner${
                      universities.length === 1 ? "" : "s"
                    }.`
                  : "Pick a country to see the partner list."}
              </span>
            </div>

            <div className={styles.fieldGroupFull}>
              <div className={`${styles.recommendationCard} ${wantsRecommendations ? styles.recommendationCardActive : ""}`}>
                <h3>Need help choosing?</h3>
                <p>Tell us the courses you must complete and we&apos;ll recommend the strongest partner matches.</p>
                <button
                  type="button"
                  className={styles.inlineButton}
                  onClick={() => handleRecommendationMode(!wantsRecommendations)}
                >
                  {wantsRecommendations ? "Disable smart recommendations" : "Recommend partners for me"}
                </button>
                {wantsRecommendations ? (
                  <span className={styles.helper}>
                    We&apos;ll skip partner selection and score every university once you add your courses.
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className={styles.formGrid}>
            <div className={styles.fieldGroup}>
              <label>Courses you must complete next term</label>
              <span className={styles.helper}>
                Enter the course codes exactly as they appear on your degree plan (e.g. MGT101).
              </span>
              {wantsRecommendations ? (
                <div className={styles.recommendationBanner}>
                  We&apos;ll use these courses to score every partner university and highlight the best matches.
                </div>
              ) : null}
              <div className={styles.courseList}>
                {courseInputs.map((value, index) => (
                  <div key={index} className={styles.courseField}>
                    <input
                      className={[styles.input, styles.courseInput].join(" ")}
                      placeholder="ABC123"
                      value={value}
                      onChange={(event) => handleCourseChange(index, event.target.value)}
                      onFocus={() => handleCourseFocus()}
                    />
                  </div>
                ))}
                <div className={styles.addCourseButtonWrapper}>
                  <button
                    type="button"
                    className={styles.addCourseButton}
                    onClick={handleAddCourseField}
                    aria-label="Add another course"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        if (wantsRecommendations) {
          return (
            <div className={styles.reviewContainer}>
              <div className={styles.summarySection}>
                <h3 className={styles.summaryTitle}>Recommended partners</h3>
                <p className={styles.tagline}>
                  We ranked partner universities based on your requested courses. Click on a university below to select it and proceed with your application.
                </p>
              </div>

              <div className={styles.resultList}>
                {recommendations.length > 0 ? (
                  recommendations.map((recommendation, index) => (
                    <div 
                      key={`${recommendation.university}-${recommendation.country}`} 
                      className={`${styles.resultCard} ${styles.selectableCard} ${
                        selectedUniversity === recommendation.university && selectedCountry === recommendation.country
                          ? styles.selectedCard
                          : ''
                      }`}
                      onClick={() => {
                        setSelectedCountry(recommendation.country);
                        setSelectedUniversity(recommendation.university);
                        setWantsRecommendations(false);
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <div className={styles.resultHeader}>
                        <div>
                          {index === 0 ? (
                            <div className={styles.topPickBadge}>Top Pick</div>
                          ) : (
                            <div className={styles.rankNumber}>{index + 1}.</div>
                          )}
                          <h3>{recommendation.university}</h3>
                          <span className={styles.detailLabel}>{recommendation.country}</span>
                        </div>
                        <span className={styles.matchPercentage}>
                          {Math.round(recommendation.coverage * 100)}% match
                        </span>
                      </div>

                      <div className={styles.courseDetail} style={{ marginTop: '12px', marginBottom: '8px' }}>
                        <span className={styles.detailLabel}>Course Breakdown:</span>
                        <strong>{recommendation.approvedCount} approved • {recommendation.conditionalCount} conditional • {recommendation.pendingCount} pending</strong>
                        {recommendation.missingCourses.length > 0 && (
                          <span style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>
                            {recommendation.missingCourses.length} courses not available
                          </span>
                        )}
                      </div>

                      {recommendation.missingCourses.length > 0 && (
                        <div className={styles.courseNotes}>
                          <span className={styles.detailLabel}>Missing courses:</span> {recommendation.missingCourses.join(", ")}
                        </div>
                      )}
                      
                      {selectedUniversity === recommendation.university && selectedCountry === recommendation.country && (
                        <div className={styles.selectedIndicator}>
                          Selected
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className={styles.notice}>
                    We couldn&apos;t find strong matches yet. Try adjusting your course list or pick a partner manually.
                  </div>
                )}
              </div>
            </div>
          );
        }

        return (
          <div className={styles.reviewContainer}>
            <div className={styles.summarySection}>
              <h3 className={styles.summaryTitle}>Eligibility summary</h3>
              <p className={styles.tagline}>
                {summary.allApproved
                  ? "Great news! Every course you entered is pre-approved for this partner."
                  : "Some courses require follow-up. You can still submit, and the mobility team will review."}
              </p>

              <div className={styles.summary}>
                <strong>{summary.approvedCount} approved matches</strong>
                <span>
                  {summary.conditionalCount} conditional | {summary.pendingCount} pending | {summary.missingCount} not yet mapped
                </span>
                <small>
                  A detailed email including all notes will reach the mobility inbox once you submit.
                </small>
              </div>
            </div>

            <div className={styles.resultList}>
              {evaluatedCourses.map((course) => (
                <div key={course.normalizedCode} className={styles.resultCard}>
                  <div className={styles.resultHeader}>
                    <h3>{course.normalizedCode}</h3>
                    <span
                      className={`${styles.statusPill} ${
                        course.status === "approved"
                          ? styles.statusApproved
                          : course.status === "conditional"
                          ? styles.statusConditional
                          : course.status === "pending"
                          ? styles.statusPending
                          : styles.statusMissing
                      }`}
                    >
                      {course.status}
                    </span>
                  </div>
                  {course.mapping?.hostCourseTitle ? (
                    <div className={styles.courseDetail}>
                      <span className={styles.detailLabel}>Host course:</span>
                      <strong>{course.mapping.hostCourseTitle}</strong>
                    </div>
                  ) : null}
                  <div className={styles.courseMessage}>{course.message}</div>
                  {course.mapping?.notes ? (
                    <div className={styles.courseNotes}>
                      <span className={styles.detailLabel}>Notes:</span> {course.mapping.notes}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const timelineSteps = steps.map((step, index) => ({
    id: step.id,
    title: step.title,
    completed: completedSteps.has(index),
  }));

  if (isLoadingDraft) {
    return (
      <section className={styles.shell}>
        <div className={styles.loadingState}>Loading...</div>
      </section>
    );
  }

  return (
    <section className={styles.shell}>
      <header className={styles.topBar}>
        <Image
          src="https://raw.githubusercontent.com/Surbee001/webimg/main/Artboard%201.png"
          alt="Office of International Academic Affairs"
          className={styles.logo}
          width={200}
          height={70}
          priority
        />
      </header>

      <main className={styles.main}>
        <div className={styles.hero}>
          <h1>{heroTitle}</h1>
          <p>{heroCopy}</p>
        </div>
        <div className={styles.contentWrapper}>
          <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.sectionTitle}>{steps[currentStep].title}</h2>
            <span className={styles.stepBadge}>{progressLabel}</span>
          </div>

          <div className={styles.cardBody} ref={cardBodyRef}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className={styles.actions}>
            {currentStep === 0 && (
              <button
                type="button"
                className={styles.populateButton}
                onClick={populateMockData}
              >
                Populate sample data
              </button>
            )}

            <button
              type="button"
              className={styles.secondaryButton}
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              Back
            </button>

            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                className={styles.primaryButton}
                onClick={handleNext}
                disabled={!canAdvance}
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                className={styles.primaryButton}
                onClick={handleSubmitApplication}
                disabled={
                  submissionState === "submitting" ||
                  submissionState === "success" ||
                  evaluatedCourses.length === 0 ||
                  !selectedUniversity
                }
              >
                {submissionState === "submitting"
                  ? "Submitting..."
                  : submissionState === "success"
                  ? "Application submitted"
                  : !selectedUniversity
                  ? "Select a university to submit"
                  : "Submit application"}
              </button>
            )}
          </div>

          {submissionState === "success" && (
            <div className={styles.notice}>
              We received your application. A confirmation email will be sent once the mobility team processes it.
            </div>
          )}

          {submissionState === "error" && submissionError && (
            <div className={styles.notice}>
              There was a problem submitting your application: {submissionError}
            </div>
          )}
        </div>
        
        <StepTimeline
          steps={timelineSteps}
          currentStep={currentStep}
          onStepClick={handleTimelineClick}
          draftId={draftId}
          applicationSubmitted={submissionState === "success"}
        />
      </div>
      </main>
    </section>
  );
}




























