"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, Target } from "lucide-react";
import { GapAnalysis } from "@/components/GapAnalysis";

export function JobPostingAnalyzer() {
  const [jobDescription, setJobDescription] = useState("");
  const [extractedRequirements, setExtractedRequirements] = useState<{
    requiredSkills: string[];
    role: string;
    description: string;
  } | null>(null);
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedSkills = sessionStorage.getItem("userSkills");
    if (savedSkills) setUserSkills(JSON.parse(savedSkills));
  }, []);

  const analyzeJobPosting = async () => {
    if (!jobDescription.trim()) return;

    setLoading(true);
    try {
      const response = await fetch("/api/job-posting/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription }),
      });

      if (response.ok) {
        const data = await response.json();
        setExtractedRequirements(data);
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
        </CardContent>
      </Card>

      {extractedRequirements && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Extracted Requirements</CardTitle>
              <CardDescription>{extractedRequirements.role}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">{extractedRequirements.description}</p>
              <div>
                <h4 className="font-semibold mb-2">Required Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {extractedRequirements.requiredSkills.map((skill, idx) => (
                    <Badge key={idx} variant="default">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {userSkills.length > 0 && (
            <GapAnalysis
              userSkills={userSkills}
              requiredSkills={extractedRequirements.requiredSkills}
              roleName={extractedRequirements.role}
            />
          )}
        </>
      )}
    </div>
  );
}
