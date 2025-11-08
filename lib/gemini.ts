import { GoogleGenerativeAI } from "@google/generative-ai";

// Read keys from a new `GEMINI_API_KEYS` (plural) or fall back to the single key
const API_KEYS = (process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || "")
  .split(',')
  .map(k => k.trim())
  .filter(k => k);

if (API_KEYS.length === 0) {
  console.warn("GEMINI_API_KEY or GEMINI_API_KEYS is not set in environment variables. Gemini features will fail.");
}

/**
 * A robust function that attempts to generate content using a list of API keys,
 * failing over to the next key if the previous one fails.
 * @param prompt The prompt to send to the generative model.
 * @returns The result from the generative model.
 */
async function generateContentWithFailover(prompt: string) {
  if (API_KEYS.length === 0) {
    console.error("Cannot generate content: No Gemini API keys provided.");
    // Return a response structure that mimics a failed API call
    return {
      response: {
        text: () => JSON.stringify({ error: "No API keys configured on the server." }),
      },
    };
  }

  let lastError: any = null;

  for (const key of API_KEYS) {
    try {
      const genAI = new GoogleGenerativeAI(key);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash", // Using the 'flash' model as requested
      });
      
      const result = await model.generateContent(prompt);
      // If successful, return immediately
      return result; 
    } catch (error) {
      lastError = error;
      console.warn(`Gemini API key ending in '...${key.slice(-4)}' failed. Trying next key.`);
    }
  }

  // If all keys failed, log the final error and re-throw it
  console.error("All Gemini API keys failed. Last error:", lastError);
  throw lastError;
}

// Export a model object that's compatible with the rest of the app.
// Its `generateContent` method is now our robust failover function.
export const geminiModel = {
  generateContent: generateContentWithFailover,
};


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
- Free interactive courses (e.g., freeCodeCamp, Coursera free courses, Udemy free courses)
- Official documentation or highly-regarded articles/blogs
- Video tutorials (e.g., YouTube, Khan Academy)

For each resource, provide a direct, accessible URL.

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