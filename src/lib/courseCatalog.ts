import type { CourseMappingRow } from "@/data/sampleCourseMappings";

export type EvaluatedCourse = {
  inputCode: string;
  normalizedCode: string;
  status: "approved" | "conditional" | "pending" | "missing";
  mapping?: CourseMappingRow;
  message: string;
};

export type UniversityCourseMatch = {
  courseCode: string;
  status: "approved" | "conditional" | "pending" | "notApproved";
  hostCourseTitle?: string;
  notes?: string;
};

export type UniversityRecommendation = {
  university: string;
  country: string;
  approvedCount: number;
  conditionalCount: number;
  pendingCount: number;
  notApprovedCount: number;
  score: number;
  coverage: number;
  matchedCourses: UniversityCourseMatch[];
  missingCourses: string[];
  totalRequested: number;
};

const APPROVED_KEYWORDS = ["approved", "pre-approved", "confirmed"];
const CONDITIONAL_KEYWORDS = ["conditional", "provisional", "pending syllabus"];

const STATUS_PRIORITY: Record<UniversityCourseMatch["status"], number> = {
  approved: 4,
  conditional: 3,
  pending: 2,
  notApproved: 1,
};

function classifyMapping(mapping: CourseMappingRow): UniversityCourseMatch["status"] {
  const statusValue = (mapping.status ?? "").toString().trim().toLowerCase();

  if (!statusValue) {
    return "pending";
  }

  const isApproved =
    statusValue === "approved" ||
    statusValue === "yes" ||
    statusValue === "pre-approved" ||
    APPROVED_KEYWORDS.some((keyword) => statusValue.includes(keyword));

  const isNotApproved =
    statusValue === "notapproved" ||
    statusValue === "no" ||
    statusValue.includes("not approved") ||
    statusValue.includes("rejected") ||
    statusValue.includes("denied");

  const isConditional =
    statusValue === "conditional" ||
    CONDITIONAL_KEYWORDS.some((keyword) => statusValue.includes(keyword));

  if (isApproved && !isNotApproved) {
    return "approved";
  }

  if (isNotApproved) {
    return "notApproved";
  }

  if (isConditional) {
    return "conditional";
  }

  return "pending";
}

export function normalizeCode(value: string): string {
  return value.trim().toUpperCase();
}

export function listCountries(rows: CourseMappingRow[]): string[] {
  return Array.from(new Set(rows.map((row) => row.country))).sort();
}

export function listUniversities(rows: CourseMappingRow[], country: string): string[] {
  return Array.from(
    new Set(
      rows
        .filter((row) => row.country === country)
        .map((row) => row.university.trim())
    )
  ).sort();
}

export function evaluateCourseCodes(
  codes: string[],
  rows: CourseMappingRow[],
  filters: { country: string; university: string }
): EvaluatedCourse[] {
  return codes
    .map(normalizeCode)
    .filter((code) => code.length > 0)
    .map((normalizedCode) => {
      const mapping = rows.find(
        (row) => {
          const rowUniversity = row.university.trim().toLowerCase();
          const filterUniversity = filters.university.trim().toLowerCase();
          const codeMatch = normalizeCode(row.homeCourseCode) === normalizedCode;

          return rowUniversity === filterUniversity && codeMatch;
        }
      );

      if (!mapping) {
        const existsElsewhere = rows.some(
          (row) => normalizeCode(row.homeCourseCode) === normalizedCode
        );

        if (existsElsewhere) {
          return {
            inputCode: normalizedCode,
            normalizedCode,
            status: "missing",
            message: `${normalizedCode} is not offered at ${filters.university}. This course may be available at other partner universities.`,
          } satisfies EvaluatedCourse;
        } else {
          return {
            inputCode: normalizedCode,
            normalizedCode,
            status: "missing",
            message: `${normalizedCode} is not found in our course database. Please verify the course code or contact your advisor.`,
          } satisfies EvaluatedCourse;
        }
      }

      const classification = classifyMapping(mapping);

      if (classification === "approved") {
        return {
          inputCode: normalizedCode,
          normalizedCode,
          status: "approved",
          mapping,
          message: "Approved match found.",
        } satisfies EvaluatedCourse;
      }

      if (classification === "notApproved") {
        return {
          inputCode: normalizedCode,
          normalizedCode,
          status: "pending",
          mapping,
          message: mapping.notes ?? "This course is not approved for credit transfer.",
        } satisfies EvaluatedCourse;
      }

      if (classification === "conditional") {
        return {
          inputCode: normalizedCode,
          normalizedCode,
          status: "conditional",
          mapping,
          message: mapping.notes ?? "Conditional approval. Please attach supporting documents.",
        } satisfies EvaluatedCourse;
      }

      return {
        inputCode: normalizedCode,
        normalizedCode,
        status: "pending",
        mapping,
        message: mapping.notes ?? "Awaiting final approval from department.",
      } satisfies EvaluatedCourse;
    });
}

export function recommendUniversities(
  codes: string[],
  rows: CourseMappingRow[],
  options: { limit?: number } = {}
): UniversityRecommendation[] {
  const normalizedCodes = Array.from(
    new Set(codes.map(normalizeCode).filter((code) => code.length > 0))
  );

  if (normalizedCodes.length === 0) {
    return [];
  }

  type UniversityAggregate = {
    displayName: string;
    country: string;
    perCourse: Map<string, UniversityCourseMatch>;
  };

  const aggregates = new Map<string, UniversityAggregate>();

  for (const row of rows) {
    const courseCode = normalizeCode(row.homeCourseCode);
    if (!courseCode || !normalizedCodes.includes(courseCode)) {
      continue;
    }

    const trimmedUniversity = row.university.trim();
    if (!trimmedUniversity) {
      continue;
    }

    const key = trimmedUniversity.toLowerCase();
    let aggregate = aggregates.get(key);

    if (!aggregate) {
      aggregate = {
        displayName: trimmedUniversity,
        country: row.country,
        perCourse: new Map<string, UniversityCourseMatch>(),
      };
      aggregates.set(key, aggregate);
    }

    const status = classifyMapping(row);
    const candidate: UniversityCourseMatch = {
      courseCode,
      status,
      hostCourseTitle: row.hostCourseTitle,
      notes: row.notes,
    };

    const current = aggregate.perCourse.get(courseCode);
    if (!current || STATUS_PRIORITY[status] > STATUS_PRIORITY[current.status]) {
      aggregate.perCourse.set(courseCode, candidate);
    }
  }

  const recommendations: UniversityRecommendation[] = [];

  for (const aggregate of aggregates.values()) {
    if (aggregate.perCourse.size === 0) {
      continue;
    }

    const matchedCourses = Array.from(aggregate.perCourse.values()).sort(
      (a, b) => STATUS_PRIORITY[b.status] - STATUS_PRIORITY[a.status]
    );

    let approvedCount = 0;
    let conditionalCount = 0;
    let pendingCount = 0;
    let notApprovedCount = 0;

    for (const match of matchedCourses) {
      switch (match.status) {
        case "approved":
          approvedCount += 1;
          break;
        case "conditional":
          conditionalCount += 1;
          break;
        case "pending":
          pendingCount += 1;
          break;
        case "notApproved":
          notApprovedCount += 1;
          break;
      }
    }

    const missingCourses = normalizedCodes.filter(
      (code) => !aggregate.perCourse.has(code)
    );

    const coverage = matchedCourses.length / normalizedCodes.length;
    const score =
      approvedCount * 4 +
      conditionalCount * 2 +
      pendingCount * 1 -
      notApprovedCount * 2;

    recommendations.push({
      university: aggregate.displayName,
      country: aggregate.country,
      approvedCount,
      conditionalCount,
      pendingCount,
      notApprovedCount,
      score,
      coverage,
      matchedCourses,
      missingCourses,
      totalRequested: normalizedCodes.length,
    });
  }

  // Sort by: 1) Total matched courses, 2) Approved count, 3) Score quality
  recommendations.sort((a, b) => {
    // Primary: Most matched courses wins
    const aMatchCount = a.matchedCourses.length;
    const bMatchCount = b.matchedCourses.length;
    if (bMatchCount !== aMatchCount) {
      return bMatchCount - aMatchCount;
    }

    // Secondary: Most approved courses wins
    if (b.approvedCount !== a.approvedCount) {
      return b.approvedCount - a.approvedCount;
    }

    // Tertiary: Quality score (approved=4, conditional=2, pending=1, notApproved=-2)
    if (b.score !== a.score) {
      return b.score - a.score;
    }

    // Final: Alphabetical
    return a.university.localeCompare(b.university);
  });

  const limit = options.limit ?? recommendations.length;
  return recommendations.slice(0, limit);
}

export function summariseEligibility(results: EvaluatedCourse[]): {
  allApproved: boolean;
  approvedCount: number;
  conditionalCount: number;
  pendingCount: number;
  missingCount: number;
} {
  let approvedCount = 0;
  let conditionalCount = 0;
  let pendingCount = 0;
  let missingCount = 0;

  for (const result of results) {
    switch (result.status) {
      case "approved":
        approvedCount += 1;
        break;
      case "conditional":
        conditionalCount += 1;
        break;
      case "pending":
        pendingCount += 1;
        break;
      case "missing":
        missingCount += 1;
        break;
    }
  }

  return {
    allApproved: conditionalCount === 0 && pendingCount === 0 && missingCount === 0,
    approvedCount,
    conditionalCount,
    pendingCount,
    missingCount,
  };
}

