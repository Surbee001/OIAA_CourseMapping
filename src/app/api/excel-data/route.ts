import { NextResponse } from 'next/server';
import { fetchExcelData } from '@/lib/excelDataFetcher';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('refresh') === 'true';

    const data = await fetchExcelData(forceRefresh);

    return NextResponse.json({
      success: true,
      data: data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('API error fetching Excel data:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to fetch course data',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}