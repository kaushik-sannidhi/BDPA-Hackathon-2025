import { NextRequest, NextResponse } from "next/server";
import { extractSkillsFromResume } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const { resumeText } = await request.json();
    
    if (!resumeText) {
      return NextResponse.json(
        { error: "Resume text is required" },
        { status: 400 }
      );
    }
    
    const skills = await extractSkillsFromResume(resumeText);
    
    return NextResponse.json({ skills });
  } catch (error) {
    console.error("Error extracting skills:", error);
    return NextResponse.json(
      { error: "Failed to extract skills" },
      { status: 500 }
    );
  }
}

