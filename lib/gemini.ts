import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY || null;

let geminiModel: any = null;

if (API_KEY) {
  const genAI = new GoogleGenerativeAI(API_KEY);
  geminiModel = genAI.getGenerativeModel({
    model: "gemini-2.5-pro",
  });
} else {
  console.warn("GEMINI_API_KEY is not set in environment variables - Gemini calls will use a fallback stub.");
  // Fallback stub that returns a JSON error string to avoid build-time crashes.
  geminiModel = {
    generateContent: async (_prompt: string) => {
      return {
        response: {
          text: () => JSON.stringify({ error: "GEMINI_API_KEY not set" }),
        },
      };
    },
  };
}

export { geminiModel };

export async function extractSkillsFromResume(resumeText: string): Promise<string[]> {
  const prompt = `Extract all technical and professional skills from the following resume text. Return only a JSON array of skill names, normalized to common industry terms (e.g., "JS" -> "JavaScript", "React.js" -> "React"). Focus on:
- Programming languages
- Frameworks and libraries
- Tools and technologies
- Soft skills
- Certifications

Resume text:
${resumeText}

Return only a JSON array, no other text. Example: ["JavaScript", "React", "Node.js", "Communication"]`;

  try {
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean the response to extract JSON
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return [];
  } catch (error) {
    console.error("Error extracting skills:", error);
    return [];
  }
}

export async function reviewResume(resumeText: string): Promise<{
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  score: number;
}> {
  const prompt = `Review the following resume and provide:
1. Top 3 strengths
2. Top 3 weaknesses
3. Top 5 improvement suggestions
4. Overall score (0-100)

Return as JSON:
{
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2", "weakness3"],
  "suggestions": ["suggestion1", "suggestion2", "suggestion3", "suggestion4", "suggestion5"],
  "score": 85
}

Resume text:
${resumeText}`;

  try {
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return {
      strengths: [],
      weaknesses: [],
      suggestions: [],
      score: 0,
    };
  } catch (error) {
    console.error("Error reviewing resume:", error);
    return {
      strengths: [],
      weaknesses: [],
      suggestions: [],
      score: 0,
    };
  }
}

export async function getRoleRequirements(roleName: string): Promise<{
  requiredSkills: string[];
  description: string;
  responsibilities: string[];
}> {
  const prompt = `Provide detailed requirements for the role "${roleName}" in the tech industry. Return as JSON:
{
  "requiredSkills": ["skill1", "skill2", "skill3", ...],
  "description": "Brief role description",
  "responsibilities": ["responsibility1", "responsibility2", ...]
}

Include both technical skills (programming languages, frameworks, tools) and soft skills. Focus on entry-level to mid-level requirements.`;

  try {
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // Fallback to default
    return {
      requiredSkills: [],
      description: `Requirements for ${roleName}`,
      responsibilities: [],
    };
  } catch (error) {
    console.error("Error getting role requirements:", error);
    return {
      requiredSkills: [],
      description: `Requirements for ${roleName}`,
      responsibilities: [],
    };
  }
}

export async function getLearningResources(skill: string): Promise<{
  title: string;
  url: string;
  platform: string;
  type: "Video" | "Interactive Course" | "Documentation";
}[]> {
  const prompt = `Find 2-3 high-quality, free learning resources for "${skill}". Include:
- YouTube tutorials (prefer official channels or highly-rated content)
- Free interactive courses (freeCodeCamp, Coursera free courses, etc.)
- Official documentation

Return as JSON array:
[
  {
    "title": "Resource Title",
    "url": "https://example.com",
    "platform": "Platform Name",
    "type": "Video" | "Interactive Course" | "Documentation"
  }
]

Only return real, accessible resources.`;

  try {
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return [];
  } catch (error) {
    console.error("Error getting learning resources:", error);
    return [];
  }
}
