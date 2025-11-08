import { NextRequest, NextResponse } from "next/server";
import { geminiModel } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const { jobDescription } = await request.json();

    if (!jobDescription) {
      return NextResponse.json(
        { error: "Job description is required" },
        { status: 400 }
      );
    }

    const prompt = `Extract key information from this job posting:
- Job title/role
- Required technical skills
- Required soft skills
- Role description

Job Description:
${jobDescription}

Return as JSON:
{
  "role": "Job Title",
  "description": "Brief description",
  "requiredSkills": ["skill1", "skill2", ...]
}`;

    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const extracted = JSON.parse(jsonMatch[0]);
      return NextResponse.json(extracted);
    }

    return NextResponse.json({
      role: "Unknown",
      description: "Could not extract information",
      requiredSkills: [],
    });
  } catch (error) {
    console.error("Error analyzing job posting:", error);
    return NextResponse.json(
      { error: "Failed to analyze job posting" },
      { status: 500 }
    );
  }
}

