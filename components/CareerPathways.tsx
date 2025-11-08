"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, Clock, DollarSign, Target, CheckCircle2, AlertCircle } from "lucide-react";

interface JobMatch {
  jobId: string;
  title: string;
  category: string;
  description: string;
  responsibilities: string[];
  requiredSkills: string[];
  salaryRange?: string;
  experienceLevel?: string;
  matchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
  matchScore: number;
}

interface CareerPathwaysProps {
  currentSkills: string[];
  interests?: string[];
  experience?: number;
}

export function CareerPathways({ 
  currentSkills, 
  interests = [], 
  experience = 0 
}: CareerPathwaysProps) {
  const [jobMatches, setJobMatches] = useState<JobMatch[]>([]);
  const [loading, setLoading] = useState(false);

  const lastSkillsRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchJobMatches = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const response = await fetch("/api/jobs/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userSkills: currentSkills,
          topN: 5,
        }),
        signal,
      });

      if (signal?.aborted) return;

      if (response.ok) {
        const data = await response.json();
        setJobMatches(data.matches || []);
      }
    } catch (error) {
      if ((error as any)?.name === "AbortError") {
        // aborted
      } else {
        console.error("Error fetching job matches:", error);
      }
    } finally {
      setLoading(false);
    }
  }, [currentSkills]);

  useEffect(() => {
    // Avoid refetch if skills string is identical
    const skillsKey = JSON.stringify(currentSkills.slice().sort());
    if (skillsKey === lastSkillsRef.current) return;
    lastSkillsRef.current = skillsKey;

    if (currentSkills.length === 0) {
      setJobMatches([]);
      return;
    }

    // Abort previous
    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    abortRef.current = controller;

    // Debounce small delay to avoid frequent firing on rapid updates
    const t = setTimeout(() => fetchJobMatches(controller.signal), 250);

    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [currentSkills, fetchJobMatches]);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (jobMatches.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            No job matches found. Try adding more skills to see personalized job recommendations.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-2">Top Job Matches</h2>
        <p className="text-muted-foreground">
          Based on your skills, here are the best job matches for you
        </p>
      </div>
      {jobMatches.map((match, idx) => (
        <Card key={match.jobId} className="border-2 hover:border-primary transition-colors">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <CardTitle className="text-2xl">{match.title}</CardTitle>
                  <Badge 
                    variant={match.matchPercentage >= 70 ? "default" : match.matchPercentage >= 50 ? "secondary" : "outline"}
                    className="text-sm"
                  >
                    {match.matchPercentage}% Match
                  </Badge>
                </div>
                <CardDescription className="text-base">{match.description}</CardDescription>
                <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="outline" className="text-xs">{match.category}</Badge>
                  {match.experienceLevel && (
                    <span>• {match.experienceLevel}</span>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Skills Match Section */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2 text-yellow-600">
                  <CheckCircle2 className="h-4 w-4" />
                  Your Matching Skills ({match.matchedSkills.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {match.matchedSkills.map((skill: string, skillIdx: number) => (
                    <Badge key={skillIdx} variant="default" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              {match.missingSkills.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-600">
                    <AlertCircle className="h-4 w-4" />
                    Skills to Learn ({match.missingSkills.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {match.missingSkills.slice(0, 5).map((skill: string, skillIdx: number) => (
                      <Badge key={skillIdx} variant="outline" className="border-amber-300 text-amber-700">
                        {skill}
                      </Badge>
                    ))}
                    {match.missingSkills.length > 5 && (
                      <Badge variant="outline" className="border-amber-300 text-amber-700">
                        +{match.missingSkills.length - 5} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Job Details */}
            <div className="grid md:grid-cols-2 gap-4 pt-2 border-t">
              {match.salaryRange && (
                <div className="flex items-start gap-2">
                  <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Salary Range</p>
                    <p className="text-sm text-muted-foreground">{match.salaryRange}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-2">
                <Target className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Required Skills</p>
                  <p className="text-sm text-muted-foreground">{match.requiredSkills.length} total</p>
                </div>
              </div>
            </div>

            {/* Key Responsibilities */}
            {match.responsibilities.length > 0 && (
              <div className="pt-2 border-t">
                <h4 className="font-semibold mb-2">Key Responsibilities</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  {match.responsibilities.slice(0, 3).map((resp: string, respIdx: number) => (
                    <li key={respIdx}>{resp}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
