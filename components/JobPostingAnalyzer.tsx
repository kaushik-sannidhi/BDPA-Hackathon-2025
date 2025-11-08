"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, Target } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface AnalysisResult {
  role: string;
  description: string;
  requiredSkills: string[];
  matchedSkills: string[];
  missingSkills: string[];
  matchPercentage: number;
  ease: "Easy" | "Medium" | "Hard";
  reason: string;
  recommendations: string[];
}

export function JobPostingAnalyzer() {
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const { userProfile } = useAuth();
  const userSkills = userProfile?.skills || [];

  const analyzeJobPosting = async () => {
    if (!jobDescription.trim()) return;

    setLoading(true);
    try {
      const response = await fetch("/api/job-posting/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription, userSkills }),
      });

      if (response.ok) {
        const data: AnalysisResult = await response.json();
        setResult(data);
      }
    } catch (error) {
      console.error("Error analyzing job posting:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Job Posting Analyzer
          </CardTitle>
          <CardDescription>
            Paste a job description to extract requirements and analyze your fit
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Paste job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={10}
            className="font-mono text-sm"
          />
          <Button onClick={analyzeJobPosting} disabled={loading || !jobDescription.trim()}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Target className="mr-2 h-4 w-4" />
                Analyze Job Posting
              </>
            )}
          </Button>
          {userSkills.length === 0 && (
            <p className="text-xs text-muted-foreground">No skills found in your profile yet. Add skills on your profile for a personalized fit assessment.</p>
          )}
        </CardContent>
      </Card>

      {result && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Extracted Requirements</CardTitle>
              <CardDescription>{result.role}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">{result.description}</p>
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Required Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {result.requiredSkills.map((skill, idx) => (
                    <Badge key={idx} variant="default">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {userSkills.length > 0 && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2 text-green-600">Matched Skills ({result.matchedSkills.length})</h4>
                    <div className="flex flex-wrap gap-2">
                      {result.matchedSkills.map((skill, idx) => (
                        <Badge key={idx} variant="success">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-orange-600">Missing Skills ({result.missingSkills.length})</h4>
                    <div className="flex flex-wrap gap-2">
                      {result.missingSkills.map((skill, idx) => (
                        <Badge key={idx} variant="warning">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {userSkills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Fit Assessment</CardTitle>
                <CardDescription>
                  {result.matchPercentage}% match • Difficulty: {result.ease}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {result.reason && <p className="text-sm mb-4">{result.reason}</p>}
                {result.recommendations?.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Recommendations</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      {result.recommendations.map((rec, idx) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
