import type { CourseMappingRow } from '@/data/sampleCourseMappings';

export interface ExcelCourseData {
  ajmanCourseCode: string;
  isApproved: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

let cachedData: CourseMappingRow[] | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 60 * 1000; // 60 seconds in milliseconds

function detectCountryFromUniversity(universityName: string): string {
  const name = universityName.toLowerCase();

  // USA universities
  if (name.includes('south carolina') ||
      name.includes('west alabama') ||
      name.includes('california') ||
      name.includes('colorado') ||
      name.includes('csu') ||
      name.includes('dominguez')) {
    return 'USA';
  }
  // Canadian universities
  else if (name.includes('toronto') || name.includes('mcgill')) {
    return 'Canada';
  }
  // Spanish universities
  else if (name.includes('madrid') || name.includes('barcelona') || name.includes('esade') || name.includes('ie university')) {
    return 'Spain';
  }
  // Japanese universities
  else if (name.includes('tokyo') || name.includes('keio') || name.includes('waseda')) {
    return 'Japan';
  }
  // Add more countries as needed
  else {
    return 'Other';
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapExcelToCourseMappingRow(excelRow: any, country: string, university: string): CourseMappingRow {
  // Get the Ajman Course Code first
  const courseCode = excelRow['Ajman Course Code'] || excelRow['ajmanCourseCode'] || '';
  const courseName = excelRow['Ajman Course Name'] || '';
  const partnerCourseName = excelRow['Partner Course Name'] || '';

  // Try different column names for approval status
  let isApproved = false;
  let approvalSource = 'default';

  // Check for IsApproved column (primary check) - expects "Yes" or "No"
  if (excelRow['IsApproved'] !== undefined && excelRow['IsApproved'] !== null && excelRow['IsApproved'] !== '') {
    const approvalStatus = String(excelRow['IsApproved']).toUpperCase().trim();
    isApproved = approvalStatus === 'YES' || approvalStatus === 'Y';
    approvalSource = 'IsApproved';

    // Log to verify it's reading correctly
    if (courseCode && excelRow['IsApproved']) {
      console.log(`Course ${courseCode}: IsApproved value = "${excelRow['IsApproved']}" -> ${isApproved ? 'Approved' : 'Not Approved'}`);
    }
  }
  // Fallback to Match Quality if IsApproved is empty or not found
  else if (excelRow['Match Quality']) {
    const quality = String(excelRow['Match Quality']).toLowerCase().trim();
    isApproved = quality === 'excellent' || quality === 'good';
    approvalSource = 'Match Quality';
  }

  // Only log for the first few courses to avoid clutter
  if (courseCode && ['MGT400', 'ECO200', 'FIN210', 'MGT200'].includes(courseCode)) {
    console.log(`Course ${courseCode}: ${approvalSource} = ${excelRow[approvalSource]} -> ${isApproved ? 'Approved' : 'NotApproved'}`);
  }

  return {
    country: country,
    university: university,
    homeCourseCode: courseCode,
    hostCourseTitle: partnerCourseName || courseName || `${courseCode} - Course`,
    status: isApproved ? 'Approved' : 'NotApproved',
    notes: isApproved
      ? 'This course is approved for credit transfer'
      : 'This course is NOT approved for credit transfer - please consult with your advisor'
  };
}

export async function fetchExcelData(forceRefresh: boolean = false): Promise<CourseMappingRow[]> {
  const now = Date.now();

  if (!forceRefresh && cachedData && (now - lastFetchTime) < CACHE_DURATION) {
    return cachedData;
  }

  try {
    const response = await fetch('/api/excel-proxy');

    if (!response.ok) {
      console.error('Failed to fetch Excel file from proxy');
      return getCachedOrFallbackData();
    }

    const data = await response.json();

    if (!data.success || !data.excelData) {
      console.error('Invalid response from Excel proxy');
      return getCachedOrFallbackData();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const jsonData = data.excelData as any[];

    const mappedData: CourseMappingRow[] = [];

    // Process data from the Course Mappings sheet
    for (const row of jsonData) {
      // Get partner info from the row - this is the actual university offering the course
      const partnerUniversity = (row['Partner University'] || '').trim();
      const partnerCountry = detectCountryFromUniversity(partnerUniversity);

      // Create mapping with the actual partner university from Excel
      const mapping = mapExcelToCourseMappingRow(row, partnerCountry, partnerUniversity);

      // Only add if we have a valid course code
      if (mapping.homeCourseCode) {
        mappedData.push(mapping);
      }
    }

    // If no data, use countries and universities for fallback
    if (mappedData.length === 0) {
      const fallbackCountries = ['Canada', 'Spain', 'Japan'];
      const fallbackUniversities = {
        'Canada': ['University of Toronto', 'McGill University'],
        'Spain': ['IE University', 'ESADE Business School'],
        'Japan': ['Keio University', 'Waseda University']
      };

      for (const row of jsonData) {
        for (const country of fallbackCountries) {
          for (const university of fallbackUniversities[country as keyof typeof fallbackUniversities]) {
            mappedData.push(mapExcelToCourseMappingRow(row, country, university));
          }
        }
      }
    }

    cachedData = mappedData;
    lastFetchTime = now;

    return mappedData;

  } catch (error) {
    console.error('Error fetching or parsing Excel data:', error);
    return getCachedOrFallbackData();
  }
}

function getCachedOrFallbackData(): CourseMappingRow[] {
  if (cachedData) {
    return cachedData;
  }

  const fallbackData: CourseMappingRow[] = [
    {
      country: "Canada",
      university: "University of Toronto",
      homeCourseCode: "MGT101",
      hostCourseTitle: "Introduction to Management",
      status: "Approved",
      notes: "Pre-approved course",
    },
    {
      country: "Canada",
      university: "McGill University",
      homeCourseCode: "MGT101",
      hostCourseTitle: "Foundations of Management",
      status: "Approved",
      notes: "Pre-approved course",
    }
  ];

  return fallbackData;
}

export async function getCourseMappings(): Promise<CourseMappingRow[]> {
  return fetchExcelData();
}
