"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, MessageSquare, Lightbulb } from "lucide-react";

interface InterviewQuestion {
  question: string;
  type: "technical" | "behavioral" | "system-design";
  expectedAnswerPoints: string[];
  evaluationCriteria: string;
}

interface InterviewPrepProps {
  role: string;
  skills: string[];
}

export function InterviewPrep({ role, skills }: InterviewPrepProps) {
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);

  useEffect(() => {
    fetchQuestions();
  }, [role, skills]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/interview/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, skills }),
      });

      if (response.ok) {
        const data = await response.json();
        setQuestions(data.questions || []);
      }
    } catch (error) {
      console.error("Error fetching interview questions:", error);
    } finally {
      setLoading(false);
    }
  };

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

  const getTypeColor = (type: string) => {
    switch (type) {
      case "technical":
        return "default";
      case "behavioral":
        return "secondary";
      case "system-design":
        return "outline";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Interview Questions for {role}</CardTitle>
          <CardDescription>
            Practice with {questions.length} AI-generated questions tailored to your skills
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6">
        {questions.map((question, idx) => (
          <Card key={idx} className="cursor-pointer hover:border-primary transition-colors" onClick={() => setSelectedQuestion(selectedQuestion === idx ? null : idx)}>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    <Badge variant={getTypeColor(question.type)}>
                      {question.type.replace("-", " ")}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{question.question}</CardTitle>
                </div>
              </div>
            </CardHeader>
            {selectedQuestion === idx && (
              <CardContent className="space-y-4 pt-0">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Expected Answer Points
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {question.expectedAnswerPoints.map((point, pointIdx) => (
                      <li key={pointIdx}>{point}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Evaluation Criteria</h4>
                  <p className="text-sm text-muted-foreground">{question.evaluationCriteria}</p>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

