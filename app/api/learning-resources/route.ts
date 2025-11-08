import { NextRequest, NextResponse } from "next/server";
import { getLearningResources } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  console.log("--- [/api/learning-resources] Received request ---");
  try {
    const { skill } = await request.json();
    console.log(`[/api/learning-resources] Fetching resources for skill: ${skill}`);
    
    if (!skill) {
      return NextResponse.json(
        { error: "Skill is required" },
        { status: 400 }
      );
    }
    
    let aiResources: any[] = [];
    try {
      aiResources = await getLearningResources(skill);
      console.log(`[/api/learning-resources] Found ${aiResources.length} AI resources for ${skill}.`);
    } catch (aiError) {
      console.error(`[/api/learning-resources] Error fetching AI resources for ${skill}:`, aiError);
    }
    
    const allResources = [...aiResources];
    console.log(`[/api/learning-resources] Total resources for ${skill}: ${allResources.length}`);
    
    return NextResponse.json({ resources: allResources });
  } catch (error) {
    console.error("[/api/learning-resources] General error:", error);
    return NextResponse.json(
      { error: "Failed to get learning resources" },
      { status: 500 }
    );
  }
}