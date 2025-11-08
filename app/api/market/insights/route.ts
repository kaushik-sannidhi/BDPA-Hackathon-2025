import { NextRequest, NextResponse } from "next/server";
import { geminiModel } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const { role } = await request.json();

    if (!role) {
      return NextResponse.json(
        { error: "Role is required" },
        { status: 400 }
      );
    }

    const prompt = `Provide current market insights for ${role}:
1. Top 10 in-demand skills (2024)
2. Emerging technologies to watch
3. Salary range by experience level
4. Geographic demand (US-focused)
5. Remote work availability
6. Industry growth rate

Return as JSON:
{
  "inDemandSkills": ["skill1", "skill2", ...],
  "emergingTechnologies": ["tech1", "tech2", ...],
  "salaryRanges": {
    "entry": "$X-Y",
    "mid": "$X-Y",
    "senior": "$X-Y"
  },
  "geographicDemand": "High in tech hubs",
  "remoteWorkAvailability": "X% of positions",
  "growthRate": "X% annually"
}`;

    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const insights = JSON.parse(jsonMatch[0]);
      return NextResponse.json(insights);
    }

    return NextResponse.json({
      inDemandSkills: [],
      emergingTechnologies: [],
      salaryRanges: {},
      geographicDemand: "N/A",
      remoteWorkAvailability: "N/A",
      growthRate: "N/A",
    });
  } catch (error) {
    console.error("Error getting market insights:", error);
    return NextResponse.json(
      { error: "Failed to get market insights" },
      { status: 500 }
    );
  }
}

