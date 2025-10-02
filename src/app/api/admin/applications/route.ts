import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/adminAuth";
import { promises as fs } from "fs";
import path from "path";
import { Application } from "@/types/application";

const storageFile = path.join(process.cwd(), "data", "applications-log.json");

async function readApplications(): Promise<Application[]> {
  try {
    const contents = await fs.readFile(storageFile, "utf8");
    return JSON.parse(contents) as Application[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

export async function GET(request: NextRequest) {
  const unauthorized = requireAuth(request);
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const applications = await readApplications();

    // Sort by most recent first
    applications.sort((a, b) => {
      return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
    });

    return NextResponse.json({ applications });
  } catch (error) {
    console.error("Failed to read applications:", error);
    return NextResponse.json(
      { error: "Failed to load applications" },
      { status: 500 }
    );
  }
}
