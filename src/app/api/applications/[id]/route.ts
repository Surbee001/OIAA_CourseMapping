import { NextRequest, NextResponse } from "next/server";
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const applications = await readApplications();
    const application = applications.find((app) => app.id === id);

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ application });
  } catch (error) {
    console.error("Failed to fetch application:", error);
    return NextResponse.json(
      { error: "Failed to fetch application" },
      { status: 500 }
    );
  }
}

