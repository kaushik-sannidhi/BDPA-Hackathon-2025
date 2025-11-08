import { NextRequest, NextResponse } from "next/server";
import { geminiModel } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const { currentSkills, interests = [], experience = 0 } = await request.json();

    if (!currentSkills || currentSkills.length === 0) {
      return NextResponse.json(
        { error: "Current skills are required" },
        { status: 400 }
      );
    }

    const prompt = `Based on these skills and interests, suggest 3 realistic career pathways. For each:
- Target role
- Why it's a good fit
- Required additional skills
- Timeline to transition
- Salary progression
- Growth opportunities

Current Skills: ${currentSkills.join(", ")}
Interests: ${interests.join(", ") || "Not specified"}
Experience: ${experience} years

Return as JSON array:
[
  {
    "targetRole": "Role Name",
    "whyFit": "Explanation",
    "requiredAdditionalSkills": ["skill1", "skill2"],
    "timeline": "3-6 months",
    "salaryProgression": "$60k - $90k - $120k",
    "growthOpportunities": ["opportunity1", "opportunity2"]
  }
]`;

    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const pathways = JSON.parse(jsonMatch[0]);
      return NextResponse.json({ pathways });
    }

    return NextResponse.json({ pathways: [] });
  } catch (error) {
    console.error("Error generating career pathways:", error);
    return NextResponse.json(
      { error: "Failed to generate career pathways" },
      { status: 500 }
    );
  }
}

