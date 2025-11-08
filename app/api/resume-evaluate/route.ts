import { NextRequest, NextResponse } from "next/server";
import { getRoleProfile } from "@/lib/roles";

interface ResumeEvaluationRequest {
  resumeText: string;
  roleId: string;
}

interface ResumeEvaluationResponse {
  summary: string;
  strengths: string[];
  gaps: string[];
  recommendations: string[];
  matchedKeywords: string[];
  missingKeywords: string[];
}

async function evaluateWithOpenAI(
  resumeText: string,
  roleId: string
): Promise<ResumeEvaluationResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return evaluateWithoutAI(resumeText, roleId);
  }

  const roleProfile = getRoleProfile(roleId);

  try {
    const { default: OpenAI } = await import("openai");
    const openai = new OpenAI({ apiKey });

    const prompt = `You are an experienced hiring manager for the role "${
      roleProfile.label
    }".
Analyze the following resume text and compare it to the target profile.

Role summary: ${roleProfile.summary}
Focus areas: ${roleProfile.focusAreas.join(", ")}
Target keywords: ${roleProfile.keywords.join(", ")}

Resume:
"""
${resumeText.trim()}
"""

Return a JSON object with this exact shape:
{
  "summary": "2-3 sentence overview of how well the resume aligns with the role",
  "strengths": ["bullet point strengths mapped to the role"],
  "gaps": ["bullet point gaps or missing qualifications"],
  "recommendations": ["specific actionable suggestions to improve the resume for this role"],
  "matchedKeywords": ["list of target keywords explicitly present in the resume"],
  "missingKeywords": ["target keywords that are not present but important for the role"]
}

Do not include any additional text or code fences. Only return JSON.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
    });

    const content = completion.choices[0]?.message?.content ?? "{}";
    return JSON.parse(content) as ResumeEvaluationResponse;
  } catch (error) {
    console.error("OpenAI resume evaluation error:", error);
    return evaluateWithoutAI(resumeText, roleId);
  }
}

function evaluateWithoutAI(resumeText: string, roleId: string): ResumeEvaluationResponse {
  const roleProfile = getRoleProfile(roleId);
  const lowerResume = resumeText.toLowerCase();

  const matchedKeywords = roleProfile.keywords.filter((keyword) =>
    lowerResume.includes(keyword.toLowerCase())
  );

  const missingKeywords = roleProfile.keywords.filter(
    (keyword) => !matchedKeywords.includes(keyword)
  );

  const strengths =
    matchedKeywords.length > 0
      ? [
          `Highlights relevant skills such as ${matchedKeywords
            .slice(0, 5)
            .join(", ")} that align with ${roleProfile.label} requirements.`,
        ]
      : ["Resume includes several transferable skills, but explicit role-specific keywords are limited."];

  const gaps =
    missingKeywords.length > 0
      ? [
          `Consider incorporating keywords like ${missingKeywords
            .slice(0, 5)
            .join(", ")} to better match ${roleProfile.label} expectations.`,
        ]
      : ["Covers most of the expected keywords for this role."];

  const recommendations = [
    `Add a dedicated section that showcases achievements related to ${roleProfile.focusAreas.join(
      ", "
    )}.`,
    "Quantify your impact (metrics, KPIs, performance improvements) to make accomplishments more compelling.",
    "Ensure your resume highlights recent projects with clear technologies, responsibilities, and outcomes.",
  ];

  return {
    summary: `This resume shows potential for the ${roleProfile.label} role but could improve by aligning more explicitly with the expected focus areas.`,
    strengths,
    gaps,
    recommendations,
    matchedKeywords,
    missingKeywords,
  };
}

export async function POST(request: NextRequest) {
  try {
    const { resumeText, roleId } = (await request.json()) as ResumeEvaluationRequest;

    if (!resumeText || !roleId) {
      return NextResponse.json(
        { error: "resumeText and roleId are required." },
        { status: 400 }
      );
    }

    const evaluation = await evaluateWithOpenAI(resumeText, roleId);
    return NextResponse.json(evaluation);
  } catch (error) {
    console.error("Resume evaluation error:", error);
    return NextResponse.json({ error: "Failed to evaluate resume." }, { status: 500 });
  }
}


