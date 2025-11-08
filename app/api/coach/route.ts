import { NextRequest, NextResponse } from "next/server";

interface SignalsSummary {
  eyeContact: number;
  smile: number;
  posture: number;
  speakingRatio: number;
  fillerWords: number;
}

interface CoachRequest {
  transcript?: string[];
  signalsSummary: SignalsSummary;
  role: string;
  skills: string[];
}

// Provider-agnostic AI interface
async function getAICoaching(request: CoachRequest): Promise<{ bullets: string[]; tips: string[] }> {
  const { signalsSummary, role, skills } = request;
  const apiKey = process.env.OPENAI_API_KEY;

  // If no API key, return mock deterministic responses
  if (!apiKey) {
    return getMockCoaching(signalsSummary, role, skills);
  }

  try {
    // Use OpenAI if available
    const { default: OpenAI } = await import("openai");
    const openai = new OpenAI({ apiKey });

    const prompt = `You are an interview coach. Analyze the following interview performance metrics and provide feedback.

Role: ${role}
Skills: ${skills.join(", ") || "General"}

Performance Metrics:
- Eye Contact: ${signalsSummary.eyeContact.toFixed(1)}%
- Smile: ${signalsSummary.smile.toFixed(1)}%
- Posture: ${signalsSummary.posture.toFixed(1)}%
- Speaking Ratio: ${signalsSummary.speakingRatio.toFixed(1)}%
- Filler Words: ${signalsSummary.fillerWords.toFixed(1)} per minute

Provide:
1. A bullet-point summary (3-4 points) of the performance
2. Three actionable tips for improvement

Format as JSON:
{
  "bullets": ["point 1", "point 2", "point 3"],
  "tips": ["tip 1", "tip 2", "tip 3"]
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content || "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        // Fall through to mock
      }
    }

    // Fallback to mock if parsing fails
    return getMockCoaching(signalsSummary, role, skills);
  } catch (error) {
    console.error("OpenAI API error:", error);
    // Fallback to mock on error
    return getMockCoaching(signalsSummary, role, skills);
  }
}

function getMockCoaching(
  signals: SignalsSummary,
  role: string,
  skills: string[]
): { bullets: string[]; tips: string[] } {
  const bullets: string[] = [];
  const tips: string[] = [];

  // Eye contact feedback
  if (signals.eyeContact < 50) {
    bullets.push("Eye contact needs improvement - you looked away from the camera frequently.");
    tips.push("Practice maintaining eye contact by looking directly at the camera lens, not the screen.");
  } else if (signals.eyeContact > 80) {
    bullets.push("Excellent eye contact maintained throughout the session.");
  } else {
    bullets.push("Good eye contact overall, with room for minor improvements.");
  }

  // Smile feedback
  if (signals.smile < 30) {
    bullets.push("Consider smiling more to appear more approachable and confident.");
    tips.push("Remember to smile naturally, especially when discussing positive experiences or achievements.");
  } else if (signals.smile > 70) {
    bullets.push("Great use of facial expressions to convey enthusiasm.");
  }

  // Posture feedback
  if (signals.posture < 60) {
    bullets.push("Posture could be improved - try sitting up straight and facing the camera directly.");
    tips.push("Sit with your back straight, shoulders relaxed, and ensure your camera is at eye level.");
  } else {
    bullets.push("Good posture maintained during the interview.");
  }

  // Speaking feedback
  if (signals.speakingRatio < 30) {
    bullets.push("You were relatively quiet - try to speak more confidently.");
    tips.push("Practice speaking at a comfortable volume and pace. Take pauses to think, but don't be afraid to fill the silence.");
  } else if (signals.speakingRatio > 90) {
    bullets.push("You spoke almost continuously - consider adding more strategic pauses.");
  }

  // Filler words feedback
  if (signals.fillerWords > 5) {
    bullets.push(`High use of filler words (${signals.fillerWords.toFixed(1)} per minute) - practice reducing "um" and "uh".`);
    tips.push("When you need a moment to think, use a brief pause instead of filler words. It shows confidence and thoughtfulness.");
  }

  // Role-specific tips
  if (role === "Frontend" && skills.length > 0) {
    tips.push(`When discussing ${skills[0]}, use the STAR method (Situation, Task, Action, Result) to structure your answers.`);
  } else if (role === "Data Science") {
    tips.push("For technical questions, walk through your thought process step-by-step to demonstrate analytical thinking.");
  }

  // Ensure we have at least 3 tips
  while (tips.length < 3) {
    tips.push("Practice regularly to build confidence and improve your interview performance.");
  }

  return {
    bullets: bullets.slice(0, 4),
    tips: tips.slice(0, 3),
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: CoachRequest = await request.json();
    const feedback = await getAICoaching(body);
    return NextResponse.json(feedback);
  } catch (error) {
    console.error("Coach API error:", error);
    return NextResponse.json(
      { error: "Failed to generate coaching feedback" },
      { status: 500 }
    );
  }
}
