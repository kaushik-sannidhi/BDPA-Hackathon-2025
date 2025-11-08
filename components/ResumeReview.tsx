"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Lightbulb, Star } from "lucide-react";

interface ResumeReviewProps {
  resumeText: string;
}

interface ReviewResult {
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  score: number;
}

export function ResumeReview({ resumeText }: ResumeReviewProps) {
  const [review, setReview] = useState<ReviewResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleReview = async () => {
    if (!resumeText.trim()) return;

    setLoading(true);
    try {
      const response = await fetch("/api/review-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText }),
      });

      if (response.ok) {
        const result = await response.json();
        setReview(result);
      }
    } catch (error) {
      console.error("Error reviewing resume:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!resumeText) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Resume Review</CardTitle>
        <CardDescription>
          Get AI-powered feedback on your resume
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleReview} disabled={loading}>
          {loading ? (
            <>
              <span className="sr-only">Reviewing...</span>
              {/* visual spinner */}
              <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
              Reviewing...
            </>
          ) : (
            "Review Resume"
          )}
        </Button>

        {review && (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span className="text-2xl font-bold">{review.score}/100</span>
              <span className="text-muted-foreground">Overall Score</span>
            </div>

            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                Strengths
              </h3>
              <ul className="space-y-1">
                {review.strengths.map((strength, idx) => (
                  <li key={idx} className="text-sm flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                Areas for Improvement
              </h3>
              <ul className="space-y-1">
                {review.weaknesses.map((weakness, idx) => (
                  <li key={idx} className="text-sm flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>{weakness}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                Suggestions
              </h3>
              <ul className="space-y-1">
                {review.suggestions.map((suggestion, idx) => (
                  <li key={idx} className="text-sm flex items-start gap-2">
                    <span className="text-yellow-500 mt-1">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

