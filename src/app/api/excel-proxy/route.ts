import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

// Try different SharePoint URL formats
const SHAREPOINT_URLS = [
  // OneDrive/SharePoint direct download format
  'https://ajman4-my.sharepoint.com/personal/international_ajman_ac_ae/_layouts/15/download.aspx?share=EQ7hVkGTVXBBkdudcC1aK7YBZ3pJselk6V4Yzp6eqD9Ozg',
  // Alternative format with guestaccess
  'https://ajman4-my.sharepoint.com/personal/international_ajman_ac_ae/_layouts/15/guestaccess.aspx?share=EQ7hVkGTVXBBkdudcC1aK7YBZ3pJselk6V4Yzp6eqD9Ozg&e=hzviI1&download=1',
  // Original format
  'https://ajman4-my.sharepoint.com/:x:/g/personal/international_ajman_ac_ae/EQ7hVkGTVXBBkdudcC1aK7YBZ3pJselk6V4Yzp6eqD9Ozg?e=hzviI1&download=1'
];

export async function GET() {
  let lastError = null;

  // Try each URL format
  for (const url of SHAREPOINT_URLS) {
    try {
      console.log('Trying SharePoint URL:', url);
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        },
        redirect: 'follow'
      });

      if (response.ok) {
        console.log('Successfully fetched from SharePoint');
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });

        console.log('Available sheets:', workbook.SheetNames);

        // Try to find the Course Mappings sheet first
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let jsonData: any[] = [];
        const courseMappingSheet = workbook.Sheets['Course Mappings'];

        if (courseMappingSheet) {
          console.log('Found Course Mappings sheet');

          // Try to read with defval option to include all columns
          const rawData = XLSX.utils.sheet_to_json(courseMappingSheet, { defval: '' });

          // Also try to get the range to see all columns
          const range = XLSX.utils.decode_range(courseMappingSheet['!ref'] || 'A1');
          console.log('Sheet range:', courseMappingSheet['!ref']);

          // Get headers from the first row
          const headers = [];
          for (let col = range.s.c; col <= range.e.c; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
            const cell = courseMappingSheet[cellAddress];
            if (cell && cell.v) {
              headers.push(cell.v);
            }
          }
          console.log('All headers found in sheet:', headers);

          // Check the first few rows to see the structure
          if (rawData.length > 0 && rawData[0]) {
            console.log('Columns parsed by sheet_to_json:', Object.keys(rawData[0]));

            // Check if IsApproved column exists
            const firstRow = rawData[0] as Record<string, unknown>;
            if (firstRow && 'IsApproved' in firstRow) {
              console.log('Found IsApproved column! Sample values:',
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                rawData.slice(0, 3).map((r: any) => r['IsApproved']));
            }
          }

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          jsonData = rawData as any[];
        } else {
          // Try to find any sheet with the columns we need
          for (const sheetName of workbook.SheetNames) {
            const sheet = workbook.Sheets[sheetName];
            const sheetData = XLSX.utils.sheet_to_json(sheet);

            // Check if this sheet has the columns we need
            if (sheetData.length > 0 && sheetData[0]) {
              const firstRow = sheetData[0] as Record<string, unknown>;
              if (firstRow && ('Ajman Course Code' in firstRow || 'IsApproved' in firstRow)) {
                console.log(`Found course data in sheet: ${sheetName}`);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                jsonData = sheetData as any[];
                break;
              }
            }
          }
        }

        // If still no data, use fallback
        if (jsonData.length === 0) {
          console.log('No suitable sheet found, using fallback');
          return NextResponse.json({
            success: false,
            error: 'Could not find course mapping data in Excel',
            excelData: getFallbackData()
          });
        }

        return NextResponse.json({
          success: true,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          excelData: jsonData as any[],
          sheetNames: workbook.SheetNames,
          timestamp: new Date().toISOString()
        });
      } else {
        lastError = `HTTP ${response.status}: ${response.statusText}`;
        console.error('Failed with status:', response.status);
      }
    } catch (error) {
      lastError = error;
      console.error('Error with URL:', url, error);
    }
  }

  // All URLs failed
  console.error('All SharePoint URLs failed, using fallback data. Last error:', lastError);
  return NextResponse.json({
    success: false,
    error: 'Failed to fetch Excel file',
    excelData: getFallbackData()
  });
}

function getFallbackData() {
  return [
    { 'Ajman Course Code': 'MGT101', 'IsApproved': 'Approved' },
    { 'Ajman Course Code': 'FIN201', 'IsApproved': 'Approved' },
    { 'Ajman Course Code': 'MKT205', 'IsApproved': 'NotApproved' },
    { 'Ajman Course Code': 'ACC210', 'IsApproved': 'Approved' },
    { 'Ajman Course Code': 'ECO110', 'IsApproved': 'NotApproved' },
    { 'Ajman Course Code': 'STM120', 'IsApproved': 'Approved' },
  ];
}