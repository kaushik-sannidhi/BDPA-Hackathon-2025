import { NextRequest, NextResponse } from "next/server";
import { getLearningResources } from "@/lib/gemini";
import { searchYouTubeVideos } from "@/lib/youtube";

export async function POST(request: NextRequest) {
  try {
    const { skill } = await request.json();
    
    if (!skill) {
      return NextResponse.json(
        { error: "Skill is required" },
        { status: 400 }
      );
    }
    
    // Get AI-curated resources
    const aiResources = await getLearningResources(skill);
    
    // Get YouTube videos if API key is available
    const youtubeVideos = await searchYouTubeVideos(`${skill} tutorial`, 3);
    
    // Combine and deduplicate
    const allResources = [...aiResources, ...youtubeVideos];
    
    return NextResponse.json({ resources: allResources });
  } catch (error) {
    console.error("Error getting learning resources:", error);
    return NextResponse.json(
      { error: "Failed to get learning resources" },
      { status: 500 }
    );
  }
}

