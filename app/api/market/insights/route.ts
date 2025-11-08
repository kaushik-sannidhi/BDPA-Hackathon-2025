import { NextRequest, NextResponse } from "next/server";
import { geminiModel } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const { role } = await request.json();

    if (!role) {
      return NextResponse.json({ error: "Role is required" }, { status: 400 });
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

    // Call the generative model and safely extract text (handle sync or Promise .text())
    let text = "";
    try {
      const result = await geminiModel.generateContent(prompt);
      const res = await result.response;

      if (res && typeof res.text === "function") {
        const maybeText = res.text();
        text = maybeText instanceof Promise ? await maybeText : String(maybeText);
      } else if (typeof res === "string") {
        text = res;
      } else {
        text = "";
      }
    } catch (aiError) {
      // Log the AI error but don't fail the whole request. Return safe defaults later so the UI can render.
      console.error("Generative model error (market insights):", aiError);
      text = ""; // fall back to empty text which will trigger the defaults below
    }

    // Try to extract JSON object from the model's text output
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const insights = JSON.parse(jsonMatch[0]);

        // Ensure the shape includes default fields if missing
        const safeInsights = {
          inDemandSkills: Array.isArray(insights.inDemandSkills) ? insights.inDemandSkills : [],
          emergingTechnologies: Array.isArray(insights.emergingTechnologies) ? insights.emergingTechnologies : [],
          salaryRanges: insights.salaryRanges && typeof insights.salaryRanges === "object" ? insights.salaryRanges : {},
          geographicDemand: insights.geographicDemand ?? "N/A",
          remoteWorkAvailability: insights.remoteWorkAvailability ?? "N/A",
          growthRate: insights.growthRate ?? "N/A",
        };

        return NextResponse.json(safeInsights);
      }

      // If no JSON found, return reasonable defaults so the UI can render
      console.warn("AI did not return JSON for market insights, returning defaults", { text });
      return NextResponse.json({
        inDemandSkills: [],
        emergingTechnologies: [],
        salaryRanges: {},
        geographicDemand: "N/A",
        remoteWorkAvailability: "N/A",
        growthRate: "N/A",
      });
    } catch (parseErr) {
      console.error("Failed to parse AI response for market insights:", parseErr, text);
      return NextResponse.json({ error: "Failed to parse AI response", details: String(parseErr) }, { status: 502 });
    }
  } catch (error) {
    console.error("Error getting market insights:", error);
    return NextResponse.json({ error: "Failed to get market insights", details: String(error) }, { status: 500 });
  }
}
