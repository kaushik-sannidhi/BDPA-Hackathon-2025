import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API (Free tier)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
    try {
        const payload = await request.json();
        const { uid, role, question, transcript, videoBase64, skills } = payload;

        if (!question || !transcript) {
            return NextResponse.json(
                { error: "question and transcript are required" },
                { status: 400 }
            );
        }

        console.log("Evaluating answer for:", question);
        console.log("Transcript length:", transcript.length);
        console.log("Has video:", !!videoBase64);

        let evaluation = null;

        // Try to use Gemini API if available
        if (process.env.GEMINI_API_KEY) {
            try {
                const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

                const prompt = `You are an expert technical interviewer evaluating a candidate for a ${role || 'general'} position.

**Question Asked:** ${question}

**Candidate's Transcript:** ${transcript}

**Target Skills:** ${skills?.join(", ") || "General"}

**Instructions:**
Analyze the candidate's answer based on:
1. Technical accuracy and depth
2. Communication clarity and structure
3. Problem-solving approach
4. Relevant experience demonstration
5. Completeness of answer

Provide a comprehensive evaluation in the following JSON format (return ONLY valid JSON):
{
  "score": <number 1-10>,
  "strengths": [<array of 2-3 specific strengths>],
  "weaknesses": [<array of 1-2 areas for improvement>],
  "suggestions": [<array of 2-3 actionable suggestions>],
  "keyPoints": [<array of 2-3 key takeaways from the answer>]
}

Be constructive, specific, and actionable in your feedback. Score fairly based on the quality and completeness of the answer.`;

                let parts: any[] = [{ text: prompt }];

                // Add video if available (but don't fail if video processing fails)
                if (videoBase64 && videoBase64.length < 5000000) { // ~5MB limit in base64
                    try {
                        parts.push({
                            inlineData: {
                                mimeType: "video/webm",
                                data: videoBase64,
                            },
                        });
                    } catch (videoErr) {
                        console.warn("Could not include video in analysis:", videoErr);
                    }
                }

                const result = await model.generateContent(parts);
                const response = await result.response;
                const text = response.text();

                console.log("Gemini response received, length:", text.length);

                // Extract JSON from response
                const jsonMatch = text.match(/\{[\s\S]*\}/);

                if (jsonMatch) {
                    try {
                        evaluation = JSON.parse(jsonMatch[0]);
                        console.log("Successfully parsed evaluation:", evaluation);
                    } catch (parseErr) {
                        console.error("Failed to parse evaluation JSON:", parseErr);
                        console.log("Raw response:", text);
                    }
                } else {
                    console.warn("No JSON found in response:", text);
                }
            } catch (geminiErr: any) {
                console.error("Gemini API error:", geminiErr.message);
                console.error("Full error:", geminiErr);
            }
        } else {
            console.warn("No GEMINI_API_KEY found, using fallback evaluation");
        }

        // Fallback evaluation if Gemini fails or is not available
        if (!evaluation) {
            console.log("Using fallback evaluation");
            evaluation = generateFallbackEvaluation(question, transcript, role, skills);
        }

        // Validate evaluation structure
        evaluation = {
            score: Math.min(10, Math.max(1, evaluation.score || 7)),
            strengths: Array.isArray(evaluation.strengths) ? evaluation.strengths : ["Provided a relevant response"],
            weaknesses: Array.isArray(evaluation.weaknesses) ? evaluation.weaknesses : ["Could add more specific examples"],
            suggestions: Array.isArray(evaluation.suggestions) ? evaluation.suggestions : ["Practice structuring answers using the STAR method"],
            keyPoints: Array.isArray(evaluation.keyPoints) ? evaluation.keyPoints : ["Addressed the question"],
        };

        return NextResponse.json({ evaluation }, { status: 200 });
    } catch (error: any) {
        console.error("Error evaluating interview response:", error);

        // Return a basic fallback evaluation instead of failing
        const evaluation = {
            score: 7,
            strengths: ["Attempted to answer the question", "Provided relevant information"],
            weaknesses: ["Could provide more depth"],
            suggestions: ["Practice articulating your thoughts more clearly", "Use specific examples from your experience"],
            keyPoints: ["Answer was relevant to the topic"],
        };

        return NextResponse.json({ evaluation }, { status: 200 });
    }
}

function generateFallbackEvaluation(
    question: string,
    transcript: string,
    role: string | null,
    skills: string[]
): any {
    const wordCount = transcript.trim().split(/\s+/).length;
    const hasExamples = /example|instance|experience|project|worked on/i.test(transcript);
    const hasTechnicalTerms = skills.some(skill =>
        transcript.toLowerCase().includes(skill.toLowerCase())
    );

    // Calculate score based on simple heuristics
    let score = 5; // Base score

    if (wordCount > 50) score += 1;
    if (wordCount > 100) score += 1;
    if (hasExamples) score += 1;
    if (hasTechnicalTerms) score += 1;
    if (transcript.length > 200) score += 1;

    score = Math.min(10, score);

    const strengths = [];
    const weaknesses = [];
    const suggestions = [];
    const keyPoints = [];

    // Generate feedback based on analysis
    if (wordCount > 100) {
        strengths.push("Provided a detailed and comprehensive answer");
    } else if (wordCount > 50) {
        strengths.push("Gave a clear and concise response");
    } else {
        weaknesses.push("Answer could be more detailed");
        suggestions.push("Try to provide more comprehensive answers (aim for 100+ words)");
    }

    if (hasExamples) {
        strengths.push("Included specific examples or experiences");
    } else {
        weaknesses.push("Missing concrete examples");
        suggestions.push("Use the STAR method (Situation, Task, Action, Result) to structure your answers");
    }

    if (hasTechnicalTerms) {
        strengths.push(`Demonstrated knowledge of relevant skills (${skills.join(", ")})`);
    } else {
        suggestions.push("Incorporate more technical terms and concepts related to the role");
    }

    // Ensure we have at least some items in each category
    if (strengths.length === 0) {
        strengths.push("Attempted to answer the question");
    }
    if (weaknesses.length === 0) {
        weaknesses.push("Could provide more depth and detail");
    }
    if (suggestions.length === 0) {
        suggestions.push("Practice answering common interview questions");
    }

    keyPoints.push("Addressed the main topic of the question");
    if (wordCount > 75) {
        keyPoints.push("Provided sufficient detail in the response");
    }

    return {
        score,
        strengths: strengths.slice(0, 3),
        weaknesses: weaknesses.slice(0, 2),
        suggestions: suggestions.slice(0, 3),
        keyPoints: keyPoints.slice(0, 3),
    };
}