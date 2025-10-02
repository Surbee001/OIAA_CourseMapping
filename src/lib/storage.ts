import { put, list } from "@vercel/blob";
import { Application } from "@/types/application";

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const APPLICATIONS_BLOB_KEY = "applications-log.json";

// Log token status on module load (only first 10 chars for security)
if (BLOB_TOKEN) {
  console.log("[Storage] ✅ BLOB_READ_WRITE_TOKEN is configured:", BLOB_TOKEN.substring(0, 10) + "...");
} else {
  console.error("[Storage] ❌ BLOB_READ_WRITE_TOKEN is NOT configured!");
}

/**
 * Read all applications from Vercel Blob Storage
 */
export async function readApplications(): Promise<Application[]> {
  if (!BLOB_TOKEN) {
    console.warn("⚠️ BLOB_READ_WRITE_TOKEN not configured. Using empty applications list.");
    return [];
  }

  try {
    // Use list() to find the blob - more reliable than head()
    const { blobs } = await list({
      token: BLOB_TOKEN,
      prefix: APPLICATIONS_BLOB_KEY,
      limit: 1,
    });

    if (blobs.length === 0) {
      console.log("[Storage] Applications blob doesn't exist yet. Starting fresh.");
      return [];
    }

    const blobUrl = blobs[0].url;
    console.log("[Storage] Reading from blob URL:", blobUrl);
    console.log("[Storage] Blob size:", blobs[0].size, "bytes, uploaded:", blobs[0].uploadedAt);

    // Fetch the blob content with cache-busting
    const response = await fetch(blobUrl, {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
    
    if (!response.ok) {
      console.error("[Storage] Failed to fetch applications blob:", response.status, response.statusText);
      return [];
    }

    const text = await response.text();
    console.log("[Storage] Fetched blob size:", text.length, "bytes");
    
    if (!text || text.trim() === "") {
      console.log("[Storage] Empty blob content");
      return [];
    }

    const data = JSON.parse(text);
    console.log("[Storage] ✅ Successfully read", data.length, "applications");
    return data as Application[];
  } catch (error) {
    console.error("[Storage] ❌ Error reading applications:", error);
    console.error("[Storage] Error details:", error instanceof Error ? error.message : String(error));
    return [];
  }
}

/**
 * Write applications to Vercel Blob Storage
 */
export async function writeApplications(applications: Application[]): Promise<boolean> {
  if (!BLOB_TOKEN) {
    console.error("⚠️ BLOB_READ_WRITE_TOKEN not configured. Cannot save applications.");
    console.error("[Storage] Set BLOB_READ_WRITE_TOKEN in your environment variables!");
    console.log("[Storage] Application data (will be lost):", JSON.stringify(applications, null, 2));
    return false;
  }

  try {
    const jsonContent = JSON.stringify(applications, null, 2);
    
    console.log(`[Storage] 📝 Writing ${applications.length} applications (${jsonContent.length} bytes)`);
    console.log(`[Storage] Token present: ${BLOB_TOKEN ? 'YES' : 'NO'}, Token length: ${BLOB_TOKEN?.length || 0}`);
    
    const result = await put(APPLICATIONS_BLOB_KEY, jsonContent, {
      access: "public",
      token: BLOB_TOKEN,
      contentType: "application/json",
      addRandomSuffix: false, // Keep the same filename
      // @ts-ignore - allowOverwrite is not in types but exists in API
      allowOverwrite: true, // Allow overwriting existing blob
    });

    console.log(`[Storage] ✅ Successfully saved to blob!`);
    console.log(`[Storage] - URL: ${result.url}`);
    console.log(`[Storage] - Pathname: ${result.pathname}`);
    console.log(`[Storage] - Content-Type: ${result.contentType}`);
    
    return true;
  } catch (error) {
    console.error("[Storage] ❌ CRITICAL ERROR writing to blob storage!");
    console.error("[Storage] Error type:", error?.constructor?.name);
    console.error("[Storage] Error message:", error instanceof Error ? error.message : String(error));
    console.error("[Storage] Full error:", error);
    
    // Log the applications that failed to save
    console.error("[Storage] Failed to save applications:", applications.map(a => ({
      id: a.id,
      name: a.studentName,
      status: a.status
    })));
    
    return false;
  }
}

/**
 * Add a new application to storage
 */
export async function addApplication(application: Application): Promise<boolean> {
  console.log(`[Storage] Adding new application: ${application.id} (${application.studentName})`);
  const existing = await readApplications();
  console.log(`[Storage] Current applications count: ${existing.length}`);
  existing.push(application);
  console.log(`[Storage] New applications count: ${existing.length}`);
  const success = await writeApplications(existing);
  console.log(`[Storage] Add application result: ${success ? 'SUCCESS' : 'FAILED'}`);
  return success;
}

/**
 * Update an existing application
 */
export async function updateApplication(id: string, updates: Partial<Application>): Promise<Application | null> {
  const applications = await readApplications();
  const index = applications.findIndex((app) => app.id === id);

  if (index === -1) {
    return null;
  }

  applications[index] = {
    ...applications[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  const success = await writeApplications(applications);
  return success ? applications[index] : null;
}

/**
 * Delete an application
 */
export async function deleteApplication(id: string): Promise<boolean> {
  const applications = await readApplications();
  const filtered = applications.filter((app) => app.id !== id);

  if (filtered.length === applications.length) {
    return false; // Application not found
  }

  return await writeApplications(filtered);
}

/**
 * Find a single application by ID
 */
export async function findApplication(id: string): Promise<Application | null> {
  const applications = await readApplications();
  return applications.find((app) => app.id === id) || null;
}

