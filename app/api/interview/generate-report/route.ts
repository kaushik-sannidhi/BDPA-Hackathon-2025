import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
    try {
        const payload = await request.json();
        const { userId, role, skills, answers, startTime, endTime } = payload;

        if (!answers || answers.length === 0) {
            return NextResponse.json(
                { error: "No answers provided" },
                { status: 400 }
            );
        }

        console.log("Generating report for", answers.length, "answers");

        // Calculate overall score
        const scores = answers.map((a: any) => a.feedback?.score || 7);
        const overallScore = Math.round(
            scores.reduce((sum: number, s: number) => sum + s, 0) / scores.length
        );

        let reportData = null;

        // Try to use Gemini to generate comprehensive report
        if (process.env.GEMINI_API_KEY) {
            try {
                const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

                const prompt = `You are a senior technical recruiter analyzing an interview performance.

**Interview Details:**
- Role: ${role || 'General'}
- Target Skills: ${skills?.join(", ") || "General"}
- Questions Answered: ${answers.length}
- Duration: ${Math.floor((endTime - startTime) / 60000)} minutes
- Average Score: ${overallScore}/10

**Question-by-Question Performance:**
${answers
                    .map(
                        (a: any, idx: number) => `
Q${idx + 1}: ${a.question}
Answer Length: ${a.transcript?.length || 0} characters
Score: ${a.feedback?.score || 0}/10
Strengths: ${a.feedback?.strengths?.join(", ") || "N/A"}
Weaknesses: ${a.feedback?.weaknesses?.join(", ") || "N/A"}
`
                    )
                    .join("\n")}

**Instructions:**
Provide a comprehensive interview report in JSON format (return ONLY valid JSON):
{
  "overallScore": ${overallScore},
  "overallFeedback": "<2-3 paragraphs summarizing overall performance, communication skills, technical knowledge, and areas of strength>",
  "recommendations": [
    "<4-5 specific, actionable recommendations for improvement based on the actual answers>"
  ]
}

Be honest, constructive, and specific. Focus on actionable feedback that will help the candidate improve.`;

                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();

                console.log("Gemini report response received");

                // Extract JSON from response
                const jsonMatch = text.match(/\{[\s\S]*\}/);

                if (jsonMatch) {
                    try {
                        reportData = JSON.parse(jsonMatch[0]);
                        console.log("Successfully parsed report");
                    } catch (parseErr) {
                        console.error("Failed to parse report JSON:", parseErr);
                    }
                } else {
                    console.warn("No JSON found in Gemini response");
                }
            } catch (geminiErr: any) {
                console.error("Gemini API error in report generation:", geminiErr.message);
            }
        }

        // Fallback report if parsing fails or Gemini not available
        if (!reportData) {
            console.log("Using fallback report generation");
            reportData = generateFallbackReport(overallScore, answers, role, skills, startTime, endTime);
        }

        // Build final report with validation
        const report = {
            id: `interview_${Date.now()}`,
            userId: userId || "anonymous",
            role: role || "General",
            skills: skills || [],
            startTime,
            endTime,
            answers,
            overallScore: reportData.overallScore || overallScore,
            overallFeedback: reportData.overallFeedback || "Interview completed successfully.",
            recommendations: Array.isArray(reportData.recommendations)
                ? reportData.recommendations
                : ["Continue practicing mock interviews", "Review technical concepts", "Work on communication skills"],
            generatedAt: Date.now(),
        };

        console.log("Report generated successfully");
        return NextResponse.json({ report }, { status: 200 });
    } catch (error) {
        console.error("Error generating report:", error);

        // Return a basic fallback report
        try {
            const payload = await request.json();
            const { userId, role, skills, answers, startTime, endTime } = payload;

            const scores = answers?.map((a: any) => a.feedback?.score || 7) || [7];
            const overallScore = Math.round(
                scores.reduce((sum: number, s: number) => sum + s, 0) / scores.length
            );

            return NextResponse.json({
                report: {
                    id: `interview_${Date.now()}`,
                    userId: userId || "anonymous",
                    role: role || "General",
                    skills: skills || [],
                    startTime,
                    endTime,
                    answers: answers || [],
                    overallScore,
                    overallFeedback: `You completed ${answers?.length || 0} interview questions with an average score of ${overallScore}/10. Keep practicing to improve your interview skills!`,
                    recommendations: [
                        "Continue practicing mock interviews regularly",
                        "Review technical concepts related to your target role",
                        "Work on structuring your answers using the STAR method",
                        "Practice speaking clearly and confidently",
                    ],
                    generatedAt: Date.now(),
                },
            }, { status: 200 });
        } catch (fallbackErr) {
            console.error("Fallback report generation failed:", fallbackErr);
            return NextResponse.json(
                { error: "Failed to generate report" },
                { status: 500 }
            );
        }
    }
}

function generateFallbackReport(
    overallScore: number,
    answers: any[],
    role: string | null,
    skills: string[],
    startTime: number,
    endTime: number
): any {
    const duration = Math.floor((endTime - startTime) / 60000);
    const avgWordCount = answers.reduce((sum, a) =>
        sum + (a.transcript?.trim().split(/\s+/).length || 0), 0
    ) / answers.length;

    let overallFeedback = `You completed ${answers.length} interview questions for the ${role || 'general'} position with an average score of ${overallScore}/10 over ${duration} minutes. `;

    if (overallScore >= 8) {
        overallFeedback += "Your performance was strong overall, demonstrating good understanding of the subject matter and clear communication skills. ";
    } else if (overallScore >= 6) {
        overallFeedback += "Your performance showed a solid foundation, though there are areas where you can improve to strengthen your candidacy. ";
    } else {
        overallFeedback += "There are several areas where improvement would significantly strengthen your interview performance. ";
    }

    if (avgWordCount > 100) {
        overallFeedback += "You provided detailed and comprehensive answers. ";
    } else if (avgWordCount > 50) {
        overallFeedback += "Your answers were generally clear, though adding more detail and examples would strengthen your responses. ";
    } else {
        overallFeedback += "Consider providing more detailed answers with specific examples from your experience. ";
    }

    const recommendations = [];

    if (overallScore < 8) {
        recommendations.push("Practice more mock interviews to build confidence and improve your responses");
    }

    if (avgWordCount < 75) {
        recommendations.push("Work on providing more detailed answers - aim for 100-150 words per response");
    }

    recommendations.push("Use the STAR method (Situation, Task, Action, Result) to structure behavioral questions");

    if (skills && skills.length > 0) {
        recommendations.push(`Deepen your knowledge in key technical areas: ${skills.slice(0, 3).join(", ")}`);
    }

    recommendations.push("Practice articulating your thoughts clearly and confidently");

    if (overallScore >= 7) {
        recommendations.push("Continue building on your strengths while addressing minor areas for improvement");
    }

    return {
        overallScore,
        overallFeedback,
        recommendations: recommendations.slice(0, 5),
    };
}