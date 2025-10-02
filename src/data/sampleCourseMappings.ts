import { getCourseMappings } from '@/lib/excelDataFetcher';

export type CourseMappingRow = {
  country: string;
  university: string;
  homeCourseCode: string;
  hostCourseTitle: string;
  status: string;
  notes?: string;
};

let courseMappingsCache: CourseMappingRow[] | null = null;

export async function getSampleCourseMappings(): Promise<CourseMappingRow[]> {
  if (!courseMappingsCache) {
    courseMappingsCache = await getCourseMappings();
  }
  return courseMappingsCache;
}

export async function refreshCourseMappings(): Promise<CourseMappingRow[]> {
  courseMappingsCache = await getCourseMappings();
  return courseMappingsCache;
}

export const sampleCourseMappings: CourseMappingRow[] = [
  {
    country: "Canada",
    university: "University of Toronto",
    homeCourseCode: "MGT101",
    hostCourseTitle: "Introduction to Management",
    status: "Approved",
    notes: "Counts as core management credit.",
  },
  {
    country: "Canada",
    university: "University of Toronto",
    homeCourseCode: "FIN201",
    hostCourseTitle: "Corporate Finance",
    status: "Approved",
  },
  {
    country: "Canada",
    university: "University of Toronto",
    homeCourseCode: "MKT205",
    hostCourseTitle: "Consumer Behaviour",
    status: "Conditionally Approved",
    notes: "Attach syllabus for final confirmation.",
  },
  {
    country: "Canada",
    university: "McGill University",
    homeCourseCode: "MGT101",
    hostCourseTitle: "Foundations of Management",
    status: "Approved",
  },
  {
    country: "Canada",
    university: "McGill University",
    homeCourseCode: "ACC210",
    hostCourseTitle: "Intermediate Accounting I",
    status: "Approved",
  },
  {
    country: "Canada",
    university: "McGill University",
    homeCourseCode: "ECO110",
    hostCourseTitle: "Microeconomic Analysis",
    status: "Pending",
  },
  {
    country: "Spain",
    university: "IE University",
    homeCourseCode: "MGT101",
    hostCourseTitle: "Principles of Management",
    status: "Approved",
  },
  {
    country: "Spain",
    university: "IE University",
    homeCourseCode: "FIN201",
    hostCourseTitle: "Financial Decision Making",
    status: "Approved",
  },
  {
    country: "Spain",
    university: "IE University",
    homeCourseCode: "STM120",
    hostCourseTitle: "Statistics for Business",
    status: "Approved",
  },
  {
    country: "Spain",
    university: "ESADE Business School",
    homeCourseCode: "MGT101",
    hostCourseTitle: "Business Foundations",
    status: "Approved",
  },
  {
    country: "Spain",
    university: "ESADE Business School",
    homeCourseCode: "MKT205",
    hostCourseTitle: "International Marketing",
    status: "Approved",
  },
  {
    country: "Spain",
    university: "ESADE Business School",
    homeCourseCode: "FIN201",
    hostCourseTitle: "Financial Markets",
    status: "Approved",
  },
  {
    country: "Japan",
    university: "Keio University",
    homeCourseCode: "MGT101",
    hostCourseTitle: "Global Management",
    status: "Approved",
  },
  {
    country: "Japan",
    university: "Keio University",
    homeCourseCode: "FIN201",
    hostCourseTitle: "Investment Theory",
    status: "Pending",
    notes: "Awaiting updated syllabus.",
  },
  {
    country: "Japan",
    university: "Waseda University",
    homeCourseCode: "MGT101",
    hostCourseTitle: "Strategic Management",
    status: "Approved",
  },
  {
    country: "Japan",
    university: "Waseda University",
    homeCourseCode: "MKT205",
    hostCourseTitle: "Brand Strategy",
    status: "Pending",
  },
];
