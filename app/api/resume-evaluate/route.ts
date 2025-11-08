import { NextResponse } from "next/server";
import { geminiModel } from "@/lib/gemini";

export async function POST(request: Request) {
  try {
    const { resumeText, role } = await request.json();

    if (!resumeText || !role) {
      return NextResponse.json(
        { error: "Missing resumeText or role" },
        { status: 400 }
      );
    }

    const prompt = `
      Analyze the following resume in the context of a "${role}" position. 
      Provide the analysis in a JSON format with three sections: "strengths", "weaknesses", and "growthTips".

      1.  **Strengths**: Identify the top 3-4 strengths of the resume that are most relevant to the "${role}" role.
      2.  **Weaknesses**: Identify the top 3-4 weaknesses or areas for improvement in the resume, specifically concerning the "${role}" role.
      3.  **Growth Tips**: Provide a list of 3-5 actionable growth tips to improve the resume. For each tip, provide a "tip" and an optional "link" for a learning resource. If the tip is about improving the resume content (e.g., "Quantify achievements in your project descriptions"), the link should be omitted. If the tip is about learning a new skill (e.g., "Learn SQL for data analysis"), provide a relevant link to a high-quality, free resource like a tutorial, documentation, or an online course.

      Format the output as a single JSON object, like this:
      {
        "strengths": [
          "Strength 1...",
          "Strength 2..."
        ],
        "weaknesses": [
          "Weakness 1...",
          "Weakness 2..."
        ],
        "growthTips": [
          { "tip": "Quantify achievements in your project descriptions." },
          { "tip": "Learn SQL for data analysis.", "link": "https://www.w3schools.com/sql/" }
        ]
      }

      Resume Text:
      ---
      ${resumeText}
      ---
    `;

    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract the JSON part of the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0]);
      return NextResponse.json(analysis);
    } else {
      return NextResponse.json(
        { error: "Failed to parse analysis from the response." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in resume-evaluate:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}