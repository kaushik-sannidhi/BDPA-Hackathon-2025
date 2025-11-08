"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, CheckCircle2, BookOpen, Target } from "lucide-react";

interface StudyPlanWeek {
  week: number;
  focus: string;
  dailyTasks: string[];
  milestone: string;
  projects: string[];
  assessments: string[];
}

interface StudyPlanGeneratorProps {
  missingSkills: string[];
  resources: Record<string, any[]>;
}

export function StudyPlanGenerator({ missingSkills, resources }: StudyPlanGeneratorProps) {
  const [targetDate, setTargetDate] = useState("");
  const [hoursPerWeek, setHoursPerWeek] = useState(10);
  const [plan, setPlan] = useState<{ weeks: StudyPlanWeek[]; estimatedCompletion: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const generatePlan = async () => {
    if (missingSkills.length === 0) return;

    setLoading(true);
    try {
      const response = await fetch("/api/study-plan/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          missingSkills,
          resources,
          targetDate: targetDate || undefined,
          hoursPerWeek,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPlan(data);
      }
    } catch (error) {
      console.error("Error generating study plan:", error);
    } finally {
      setLoading(false);
    }
  };

  if (missingSkills.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            No missing skills to create a study plan for
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate Study Plan</CardTitle>
          <CardDescription>
            Create a personalized learning schedule for {missingSkills.length} missing skills
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Target Date (Optional)</label>
            <Input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Hours per Week</label>
            <Input
              type="number"
              min="1"
              max="40"
              value={hoursPerWeek}
              onChange={(e) => setHoursPerWeek(Number(e.target.value))}
            />
          </div>
          <Button onClick={generatePlan} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Calendar className="mr-2 h-4 w-4" />
                Generate Plan
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {plan && (
        <Card>
          <CardHeader>
            <CardTitle>Your Study Plan</CardTitle>
            <CardDescription>
              Estimated completion: {plan.estimatedCompletion}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {plan.weeks.map((week, idx) => (
                <div key={idx} className="border-l-4 border-primary pl-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="default">Week {week.week}</Badge>
                    <h3 className="font-semibold">{week.focus}</h3>
                  </div>
                  
                  <div className="space-y-3 mt-3">
                    <div>
                      <h4 className="text-sm font-medium mb-1 flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Daily Tasks
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {week.dailyTasks.map((task, taskIdx) => (
                          <li key={taskIdx}>{task}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-1 flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Milestone
                      </h4>
                      <p className="text-sm text-muted-foreground">{week.milestone}</p>
                    </div>

                    {week.projects.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-1">Practice Projects</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                          {week.projects.map((project, projIdx) => (
                            <li key={projIdx}>{project}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {week.assessments.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-1 flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4" />
                          Assessments
                        </h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                          {week.assessments.map((assessment, assIdx) => (
                            <li key={assIdx}>{assessment}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

