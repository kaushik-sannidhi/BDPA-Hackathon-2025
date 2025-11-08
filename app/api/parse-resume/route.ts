import { NextRequest, NextResponse } from "next/server";
import { parseResume } from "@/lib/resume-parser";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    const text = await parseResume(file);
    return NextResponse.json({ text });
  } catch (error) {
    console.error("Error parsing resume:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to parse resume" },
      { status: 500 }
    );
  }
}

