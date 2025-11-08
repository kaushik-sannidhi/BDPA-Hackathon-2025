import { NextRequest, NextResponse } from "next/server";
import { geminiModel } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const { missingSkills, resources, targetDate, hoursPerWeek = 10 } = await request.json();

    if (!missingSkills || missingSkills.length === 0) {
      return NextResponse.json(
        { error: "Missing skills are required" },
        { status: 400 }
      );
    }

    const prompt = `Create a structured study plan to learn: ${missingSkills.join(", ")}.
Target date: ${targetDate || "3 months from now"}
Available time: ${hoursPerWeek} hours/week

Incorporate these specific learning resources into the plan:
${JSON.stringify(resources, null, 2)}

Generate a week-by-week breakdown with daily tasks that reference the provided resources. Include milestones, practice project suggestions, and assessment checkpoints.

Return as JSON:
{
  "weeks": [
    {
      "week": 1,
      "focus": "Main topic",
      "dailyTasks": ["task1 using resource X", "task2 using resource Y"],
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

