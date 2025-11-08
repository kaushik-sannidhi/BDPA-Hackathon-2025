import { NextRequest, NextResponse } from "next/server";
import { geminiModel } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const { role, skills = [] } = await request.json();

    if (!role) {
      return NextResponse.json(
        { error: "Role is required" },
        { status: 400 }
      );
    }

    const prompt = `Generate 10 interview questions for ${role} focusing on ${skills.join(", ")}. Include:
- 5 technical questions
- 3 behavioral questions
- 2 system design questions

For each, provide:
- Question
- Expected answer points (array)
- Evaluation criteria

Return as JSON array:
[
  {
    "question": "Question text",
    "type": "technical" | "behavioral" | "system-design",
    "expectedAnswerPoints": ["point1", "point2"],
    "evaluationCriteria": "What interviewers look for"
  }
]`;

    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const questions = JSON.parse(jsonMatch[0]);
      return NextResponse.json({ questions });
    }

    return NextResponse.json({ questions: [] });
  } catch (error) {
    console.error("Error generating interview questions:", error);
    return NextResponse.json(
      { error: "Failed to generate interview questions" },
      { status: 500 }
    );
  }
}

