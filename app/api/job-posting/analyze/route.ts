import { NextRequest, NextResponse } from "next/server";
import { geminiModel } from "@/lib/gemini";
import { matchSkills, normalizeSkill } from "@/lib/skills";

export async function POST(request: NextRequest) {
  try {
    const { jobDescription, userSkills = [] } = await request.json();

    if (!jobDescription) {
      return NextResponse.json(
        { error: "Job description is required" },
        { status: 400 }
      );
    }

    // Ask Gemini 2.5 Flash to extract requirements and assess candidate fit
    const prompt = `You are a career assistant.

Extract key information from the job posting and assess the candidate's fit based on their skills.

Return ONLY valid JSON with this exact schema (no extra text):
{
  "role": string,
  "description": string,
  "requiredSkills": string[],
  "matchedSkills": string[],
  "missingSkills": string[],
  "matchPercentage": number, // 0-100
  "ease": "Easy" | "Medium" | "Hard", // how easy it is for the candidate to get this job
  "reason": string, // one short paragraph explaining the assessment
  "recommendations": string[] // 3-6 actionable steps to improve chances
}

Candidate skills (normalized list): ${JSON.stringify((userSkills || []).map((s: string) => normalizeSkill(s)))}

Job Description:
"""
${jobDescription}
"""`;

    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    let extracted: any = {
      role: "Unknown",
      description: "",
      requiredSkills: [],
      matchedSkills: [],
      missingSkills: [],
      matchPercentage: 0,
      ease: "Medium",
      reason: "",
      recommendations: [],
    };

    if (jsonMatch) {
      try {
        extracted = JSON.parse(jsonMatch[0]);
      } catch {}
    }

    // Recompute match deterministically if userSkills provided
    if (Array.isArray(userSkills) && extracted?.requiredSkills?.length) {
      const { matched, missing, matchPercentage } = matchSkills(userSkills, extracted.requiredSkills);
      extracted.matchedSkills = matched;
      extracted.missingSkills = missing;
      extracted.matchPercentage = matchPercentage;
    }

    // Ensure required fields exist
    extracted.role = extracted.role || "Unknown";
    extracted.description = extracted.description || "";
    extracted.requiredSkills = Array.isArray(extracted.requiredSkills) ? extracted.requiredSkills : [];
    extracted.matchedSkills = Array.isArray(extracted.matchedSkills) ? extracted.matchedSkills : [];
    extracted.missingSkills = Array.isArray(extracted.missingSkills) ? extracted.missingSkills : [];
    extracted.matchPercentage = typeof extracted.matchPercentage === 'number' ? extracted.matchPercentage : 0;
    extracted.ease = ["Easy", "Medium", "Hard"].includes(extracted.ease) ? extracted.ease : "Medium";
    extracted.reason = typeof extracted.reason === 'string' ? extracted.reason : "";
    extracted.recommendations = Array.isArray(extracted.recommendations) ? extracted.recommendations : [];

    return NextResponse.json(extracted);
  } catch (error) {
    console.error("Error analyzing job posting:", error);
    return NextResponse.json(
      { error: "Failed to analyze job posting" },
      { status: 500 }
    );
  }
}

