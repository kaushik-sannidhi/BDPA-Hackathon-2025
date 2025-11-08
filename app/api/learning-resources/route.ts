import { NextRequest, NextResponse } from "next/server";
import { getLearningResources } from "@/lib/gemini";
import { searchYouTubeVideos } from "@/lib/youtube";

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
    
    // Fetch from both sources in parallel
    const [aiResourcesResult, youtubeResourcesResult] = await Promise.allSettled([
      getLearningResources(skill),
      searchYouTubeVideos(skill, 2) // Fetch 2 YouTube videos
    ]);

    let aiResources: any[] = [];
    if (aiResourcesResult.status === 'fulfilled') {
      aiResources = aiResourcesResult.value;
      console.log(`[/api/learning-resources] Found ${aiResources.length} AI resources for ${skill}.`);
    } else {
      console.error(`[/api/learning-resources] Error fetching AI resources for ${skill}:`, aiResourcesResult.reason);
    }

    let youtubeResources: any[] = [];
    if (youtubeResourcesResult.status === 'fulfilled') {
      youtubeResources = youtubeResourcesResult.value;
      console.log(`[/api/learning-resources] Found ${youtubeResources.length} YouTube resources for ${skill}.`);
    } else {
      console.error(`[/api/learning-resources] Error fetching YouTube resources for ${skill}:`, youtubeResourcesResult.reason);
    }
    
    // Combine and de-duplicate resources, prioritizing YouTube results
    const allResources = [...youtubeResources, ...aiResources];
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
