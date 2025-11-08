import { NextRequest, NextResponse } from "next/server";
import { getTopJobMatches, getJobMatchesByCategory } from "@/lib/jobMatching";

export async function POST(request: NextRequest) {
  try {
    const { userSkills, topN = 5, category } = await request.json();

    if (!userSkills || !Array.isArray(userSkills) || userSkills.length === 0) {
      return NextResponse.json(
        { error: "User skills are required and must be a non-empty array" },
        { status: 400 }
      );
    }

    // Get job matches
    const matches = category
      ? getJobMatchesByCategory(userSkills, category, topN)
      : getTopJobMatches(userSkills, topN);

    // Format the response
    const formattedMatches = matches.map(match => ({
      jobId: match.job.id,
      title: match.job.title,
      category: match.job.category,
      description: match.job.description,
      responsibilities: match.job.responsibilities,
      requiredSkills: match.job.requiredSkills,
      salaryRange: match.job.salaryRange,
      experienceLevel: match.job.experienceLevel,
      matchPercentage: match.matchPercentage,
      matchedSkills: match.matchedSkills,
      missingSkills: match.missingSkills,
      matchScore: match.matchScore
    }));

    return NextResponse.json({
      matches: formattedMatches,
      totalMatches: formattedMatches.length
    });
  } catch (error) {
    console.error("Error matching jobs:", error);
    return NextResponse.json(
      { error: "Failed to match jobs" },
      { status: 500 }
    );
  }
}
