import { JobRole, getAllJobs } from "./jobs";
import { matchSkills } from "./skills";

export interface JobMatch {
  job: JobRole;
  matchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
  matchScore: number;
}

/**
 * Calculate a weighted match score for a job based on user skills
 * Higher score = better match
 */
function calculateMatchScore(
  matchPercentage: number,
  matchedSkillsCount: number,
  totalRequiredSkills: number
): number {
  // Weight the percentage match more heavily
  const percentageWeight = 0.7;
  const countWeight = 0.3;
  
  const percentageScore = matchPercentage * percentageWeight;
  const countScore = (matchedSkillsCount / Math.max(totalRequiredSkills, 1)) * 100 * countWeight;
  
  return percentageScore + countScore;
}

/**
 * Match user skills against all jobs in the database
 * Returns jobs ranked by match percentage
 */
export function matchUserToJobs(
  userSkills: string[],
  options: {
    minMatchPercentage?: number;
    maxResults?: number;
    category?: string;
  } = {}
): JobMatch[] {
  const {
    minMatchPercentage = 0,
    maxResults = 10,
    category
  } = options;

  // Get all jobs or filter by category
  let jobs = getAllJobs();
  if (category) {
    jobs = jobs.filter(job => job.category === category);
  }

  // Match user skills against each job
  const matches: JobMatch[] = jobs.map(job => {
    const { matched, missing, matchPercentage } = matchSkills(
      userSkills,
      job.requiredSkills
    );

    const matchScore = calculateMatchScore(
      matchPercentage,
      matched.length,
      job.requiredSkills.length
    );

    return {
      job,
      matchPercentage,
      matchedSkills: matched,
      missingSkills: missing,
      matchScore
    };
  });

  // Filter by minimum match percentage
  const filteredMatches = matches.filter(
    match => match.matchPercentage >= minMatchPercentage
  );

  // Sort by match score (descending)
  filteredMatches.sort((a, b) => b.matchScore - a.matchScore);

  // Return top N results
  return filteredMatches.slice(0, maxResults);
}

/**
 * Get top job recommendations for a user
 */
export function getTopJobMatches(
  userSkills: string[],
  topN: number = 5
): JobMatch[] {
  return matchUserToJobs(userSkills, {
    minMatchPercentage: 20, // Only show jobs with at least 20% match
    maxResults: topN
  });
}

/**
 * Get job matches by category
 */
export function getJobMatchesByCategory(
  userSkills: string[],
  category: string,
  topN: number = 3
): JobMatch[] {
  return matchUserToJobs(userSkills, {
    category,
    maxResults: topN
  });
}

/**
 * Calculate skill gap for a specific job
 */
export function calculateSkillGap(
  userSkills: string[],
  jobId: string
): {
  matchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
  recommendations: string[];
} | null {
  const { getAllJobs } = require('./jobs');
  const job = getAllJobs().find((j: JobRole) => j.id === jobId);
  
  if (!job) {
    return null;
  }

  const { matched, missing, matchPercentage } = matchSkills(
    userSkills,
    job.requiredSkills
  );

  // Generate recommendations based on missing skills
  const recommendations = missing.slice(0, 3).map(skill => 
    `Learn ${skill} to improve your match for this role`
  );

  return {
    matchPercentage,
    matchedSkills: matched,
    missingSkills: missing,
    recommendations
  };
}
