import { NextRequest, NextResponse } from "next/server";
import { geminiModel } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const { missingSkills, targetDate, hoursPerWeek = 10 } = await request.json();

    if (!missingSkills || missingSkills.length === 0) {
      return NextResponse.json(
        { error: "Missing skills are required" },
        { status: 400 }
      );
    }

    const prompt = `Create a structured study plan to learn: ${missingSkills.join(", ")}
Target date: ${targetDate || "3 months from now"}
Available time: ${hoursPerWeek} hours/week

Generate:
- Week-by-week breakdown
- Daily tasks
- Milestones
- Practice project suggestions
- Assessment checkpoints

Return as JSON:
{
  "weeks": [
    {
      "week": 1,
      "focus": "Main topic",
      "dailyTasks": ["task1", "task2"],
      "milestone": "Milestone description",
      "projects": ["project1"],
      "assessments": ["assessment1"]
    }
  ],
  "estimatedCompletion": "X weeks"
}`;

    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const plan = JSON.parse(jsonMatch[0]);
      return NextResponse.json(plan);
    }

    return NextResponse.json({ weeks: [], estimatedCompletion: "N/A" });
  } catch (error) {
    console.error("Error generating study plan:", error);
    return NextResponse.json(
      { error: "Failed to generate study plan" },
      { status: 500 }
    );
  }
}

