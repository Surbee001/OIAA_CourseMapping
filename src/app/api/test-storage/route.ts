import { NextResponse } from "next/server";
import { put, list } from "@vercel/blob";

export async function GET() {
  const results: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    tokenConfigured: false,
    tokenValue: null,
    writeTest: null,
    readTest: null,
    listTest: null,
  };

  // Check if token is configured
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  results.tokenConfigured = !!token;
  results.tokenValue = token ? `${token.substring(0, 15)}...` : null;

  if (!token) {
    results.error = "BLOB_READ_WRITE_TOKEN not configured in environment variables";
    return NextResponse.json(results, { status: 500 });
  }

  // Test 1: Try to write to blob
  try {
    console.log("[Test] Attempting to write test blob...");
    const testData = JSON.stringify({ test: true, timestamp: Date.now() });
    
    const writeResult = await put("test-storage.json", testData, {
      access: "public",
      token: token,
      contentType: "application/json",
      addRandomSuffix: false,
    });

    results.writeTest = {
      success: true,
      url: writeResult.url,
      pathname: writeResult.pathname,
    };
    console.log("[Test] ✅ Write successful:", writeResult.url);
  } catch (error) {
    results.writeTest = {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      errorType: error?.constructor?.name,
    };
    console.error("[Test] ❌ Write failed:", error);
  }

  // Test 2: Try to list blobs
  try {
    console.log("[Test] Attempting to list blobs...");
    const { blobs } = await list({
      token: token,
      limit: 10,
    });

    results.listTest = {
      success: true,
      count: blobs.length,
      blobs: blobs.map(b => ({
        pathname: b.pathname,
        url: b.url,
        size: b.size,
        uploadedAt: b.uploadedAt,
      })),
    };
    console.log("[Test] ✅ List successful:", blobs.length, "blobs found");
  } catch (error) {
    results.listTest = {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      errorType: error?.constructor?.name,
    };
    console.error("[Test] ❌ List failed:", error);
  }

  // Test 3: Try to read what we just wrote
  const writeTest = results.writeTest as { success: boolean; url?: string } | null;
  if (writeTest?.success && writeTest.url) {
    try {
      console.log("[Test] Attempting to read test blob...");
      const response = await fetch(writeTest.url, {
        cache: "no-store",
      });

      if (response.ok) {
        const data = await response.json();
        results.readTest = {
          success: true,
          data: data,
        };
        console.log("[Test] ✅ Read successful");
      } else {
        results.readTest = {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
        console.error("[Test] ❌ Read failed:", response.status);
      }
    } catch (error) {
      results.readTest = {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
      console.error("[Test] ❌ Read failed:", error);
    }
  }

  // Determine overall status
  const allTestsPassed = 
    (results.writeTest as { success?: boolean } | null)?.success && 
    (results.readTest as { success?: boolean } | null)?.success && 
    (results.listTest as { success?: boolean } | null)?.success;

  return NextResponse.json({
    ...results,
    overallStatus: allTestsPassed ? "ALL_TESTS_PASSED" : "SOME_TESTS_FAILED",
  }, { 
    status: allTestsPassed ? 200 : 500 
  });
}

