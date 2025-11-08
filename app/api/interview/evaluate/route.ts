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
    const prompt = `You are a senior interviewer. Evaluate the candidate's answer to the question below.

Question: ${question}

Candidate response transcript: ${transcript}

Provide a JSON response with the following shape:
{
  "score": number (0-100),
  "strengths": ["..."],
  "weaknesses": ["..."],
  "detailedFeedback": "string - actionable guidance",
  "nextQuestion": "string - a follow-up or next question based on the response"
}

Be concise and only return valid JSON.`;

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

