import { put, head, list } from "@vercel/blob";
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
    // Check if blob exists
    const exists = await head(APPLICATIONS_BLOB_KEY, { token: BLOB_TOKEN }).catch(() => null);
    
    if (!exists) {
      console.log("[Storage] Applications blob doesn't exist yet. Starting fresh.");
      return [];
    }

    // Fetch the blob content
    const response = await fetch(exists.url);
    if (!response.ok) {
      console.error("[Storage] Failed to fetch applications blob:", response.status);
      return [];
    }

    const data = await response.json();
    return data as Application[];
  } catch (error) {
    console.error("[Storage] Error reading applications:", error);
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
    
    await put(APPLICATIONS_BLOB_KEY, jsonContent, {
      access: "public",
      token: BLOB_TOKEN,
      contentType: "application/json",
    });

    console.log(`[Storage] Saved ${applications.length} applications to blob storage`);
    return true;
  } catch (error) {
    console.error("[Storage] Error writing applications:", error);
    return false;
  }
}

/**
 * Add a new application to storage
 */
export async function addApplication(application: Application): Promise<boolean> {
  const existing = await readApplications();
  existing.push(application);
  return await writeApplications(existing);
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

