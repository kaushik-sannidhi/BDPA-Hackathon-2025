import { NextRequest, NextResponse } from "next/server";
import { reviewResume } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const { resumeText } = await request.json();
    
    if (!resumeText) {
      return NextResponse.json(
        { error: "Resume text is required" },
        { status: 400 }
      );
    }
    
    const review = await reviewResume(resumeText);
    
    return NextResponse.json(review);
  } catch (error) {
    console.error("Error reviewing resume:", error);
    return NextResponse.json(
      { error: "Failed to review resume" },
      { status: 500 }
    );
  }
}

