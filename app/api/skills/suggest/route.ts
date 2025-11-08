import { NextRequest, NextResponse } from "next/server";
import { geminiModel } from "@/lib/gemini";
import { commonSkills } from "@/lib/skills";

export async function POST(request: NextRequest) {
  try {
    const { partialSkill } = await request.json();

    if (!partialSkill || partialSkill.length < 2) {
      // Return common skills if query is too short
      return NextResponse.json({ suggestions: commonSkills.slice(0, 10) });
    }

    // Use Gemini for AI-powered suggestions
    const prompt = `Given the partial skill "${partialSkill}", suggest 5-10 related technical or professional skills. Return as JSON array of skill names.`;

    try {
      const result = await geminiModel.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const suggestions = JSON.parse(jsonMatch[0]);
        return NextResponse.json({ suggestions });
      }
    } catch (error) {
      console.error("Gemini suggestion error, using fallback:", error);
    }

    // Fallback to common skills matching
    const filtered = commonSkills
      .filter((skill) =>
        skill.toLowerCase().includes(partialSkill.toLowerCase())
      )
      .slice(0, 10);

    return NextResponse.json({ suggestions: filtered });
  } catch (error) {
    console.error("Error getting skill suggestions:", error);
    return NextResponse.json(
      { error: "Failed to get suggestions" },
      { status: 500 }
    );
  }
}

