import { NextRequest, NextResponse } from "next/server";
import { searchYouTubeVideos } from "@/lib/youtube";

export async function POST(request: NextRequest) {
  try {
    const { skill, difficulty = "beginner" } = await request.json();

    if (!skill) {
      return NextResponse.json(
        { error: "Skill is required" },
        { status: 400 }
      );
    }

    const query = `${skill} tutorial ${difficulty}`;
    const videos = await searchYouTubeVideos(query, 5);

    return NextResponse.json({ resources: videos });
  } catch (error) {
    console.error("Error fetching YouTube resources:", error);
    return NextResponse.json(
      { error: "Failed to fetch YouTube resources" },
      { status: 500 }
    );
  }
}

