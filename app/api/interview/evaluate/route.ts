import { NextRequest, NextResponse } from "next/server";
import { geminiModel } from "@/lib/gemini";
import { createInterviewReport } from "@/lib/firebase/realtime";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const { uid, role, question, transcript } = payload;

    if (!question || !transcript) {
      return NextResponse.json({ error: "question and transcript are required" }, { status: 400 });
    }

    // Build a prompt to evaluate the candidate's answer
    const prompt = `You are an expert interview coach providing a detailed evaluation of a candidate's answer.

Question: ${question}

Candidate's Answer (Transcript):
${transcript}

**Your Task:**
Provide a comprehensive, in-depth analysis of the candidate's response. Be critical but constructive. Do not provide a minimal response; be thorough and detailed. Your feedback is crucial for the candidate's improvement.

**Output Format (JSON only):**
Return a single JSON object with the following structure. Do not include any other text or markdown.

{
  "score": number (a score from 0 to 100, where 100 is a perfect, textbook answer),
  "strengths": [
    "string (A specific point about what the candidate did well. Be descriptive.)"
  ],
  "weaknesses": [
    "string (A specific, constructive critique of what the candidate did wrong or missed. e.g., 'The explanation of technical trade-offs was superficial.')"
  ],
  "suggestions": [
    "string (A detailed, actionable suggestion for improvement. Give a concrete example. e.g., 'To improve, you could have said: \\'I reduced latency by 30% by implementing a caching layer with Redis...\\' to show clear impact.')"
  ],
  "nextQuestion": "string (a relevant follow-up question based on their specific answer)"
}
`;

    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from model response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    let evaluation = null;

    if (jsonMatch) {
      try {
        evaluation = JSON.parse(jsonMatch[0]);
      } catch (err) {
        console.error("Failed to parse evaluation JSON:", err);
      }
    }

    // Save report to Firestore if uid provided
    if (uid) {
      await createInterviewReport({ uid, role: role || null, question, transcript, evaluation, mediaUrl: null });
    }

    return NextResponse.json({ evaluation }, { status: 200 });
  } catch (error) {
    console.error("Error evaluating interview response:", error);
    return NextResponse.json({ error: "failed to evaluate" }, { status: 500 });
  }
}

