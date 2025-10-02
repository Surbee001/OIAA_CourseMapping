import { put, list } from "@vercel/blob";
import { Application } from "@/types/application";

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const APPLICATIONS_BLOB_KEY = "applications-log.json";

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
    console.log("[Storage] Application data:", JSON.stringify(applications, null, 2));
    return false;
  }

  try {
    const jsonContent = JSON.stringify(applications, null, 2);
    
    console.log(`[Storage] Writing ${applications.length} applications (${jsonContent.length} bytes)`);
    
    const result = await put(APPLICATIONS_BLOB_KEY, jsonContent, {
      access: "public",
      token: BLOB_TOKEN,
      contentType: "application/json",
      addRandomSuffix: false, // Keep the same filename
    });

    console.log(`[Storage] ✅ Saved ${applications.length} applications to blob:`, result.url);
    return true;
  } catch (error) {
    console.error("[Storage] ❌ Error writing applications:", error);
    console.error("[Storage] Error details:", error instanceof Error ? error.message : String(error));
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

