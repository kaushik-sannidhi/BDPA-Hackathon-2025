"use client";

import { useState, useEffect, useMemo } from "react";
import { Dashboard } from "@/components/Dashboard";
import { JobPostingAnalyzer } from "@/components/JobPostingAnalyzer";
import { MarketInsights } from "@/components/MarketInsights";
import { StudyPlanGenerator } from "@/components/StudyPlanGenerator";
import { GapAnalysis } from "@/components/GapAnalysis";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { BookOpen, Briefcase, TrendingUp, BarChart3, ArrowRight } from "lucide-react";
import { matchSkills } from "@/lib/skills";

export default function ResourcesPage() {
  const router = useRouter();
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  
  const userSkills = userProfile?.skills || [];
  const selectedRole = userProfile?.selectedRole || null;
  const roleRequirements = userProfile?.roleRequirements || null;

  const [learningResources, setLearningResources] = useState<Record<string, any[]>>({});
  const [loadingResources, setLoadingResources] = useState<Set<string>>(new Set());

  const { missing: missingSkills } = useMemo(() => roleRequirements
    ? matchSkills(userSkills, roleRequirements.requiredSkills)
    : { matched: [], missing: [], matchPercentage: 0 }, [userSkills, roleRequirements]);

  useEffect(() => {
    if (missingSkills.length === 0) return;

    const controller = new AbortController();

    const fetchForSkill = async (skill: string) => {
      if (learningResources[skill]) return;

      setLoadingResources(prev => new Set(prev).add(skill));
      try {
        const response = await fetch("/api/learning-resources", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ skill }),
          signal: controller.signal,
        });
        if (response.ok) {
          const data = await response.json();
          setLearningResources(prev => ({ ...prev, [skill]: data.resources || [] }));
        }
      } catch (error) {
        if ((error as any)?.name !== 'AbortError') {
          console.error(`Failed to fetch resources for ${skill}`, error);
        }
      } finally {
        setLoadingResources(prev => {
          const next = new Set(prev);
          next.delete(skill);
          return next;
        });
      }
    };

    missingSkills.forEach(fetchForSkill);

    return () => controller.abort();
  }, [missingSkills, learningResources]);

  if (userProfile && !userSkills.length && !selectedRole) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto px-4 py-12">
          <Card>
            <CardHeader>
              <CardTitle>Welcome to Your Resources Hub</CardTitle>
              <CardDescription>
                Complete your profile to see personalized insights and analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-foreground/70">
                  To get started, please add your skills and select a target role in your profile.
                </p>
                <div className="flex gap-4">
                  <Button onClick={() => router.push("/profile")}>
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Go to Profile
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Resources</h1>
          <p className="text-foreground/70">
            Your comprehensive hub for skill analysis, career growth, and market insights.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="flex w-full bg-muted p-1 rounded-lg">
            <TabsTrigger 
              value="dashboard" 
              className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger 
              value="learning" 
              className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              Learning
            </TabsTrigger>
            <TabsTrigger 
              value="jobs" 
              className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-colors"
            >
              <Briefcase className="w-4 h-4" />
              Job Analyzer
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {selectedRole && roleRequirements ? (
              <Dashboard
                userSkills={userSkills}
                requiredSkills={roleRequirements.requiredSkills}
                roleName={selectedRole}
              />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>No Role Selected</CardTitle>
                  <CardDescription>
                    Select a target role in your profile to see detailed analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => router.push("/profile")}>
                    Go to Profile
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

<TabsContent value="learning" className="space-y-6">
            {selectedRole && roleRequirements ? (
              <>
                <GapAnalysis
                  userSkills={userSkills}
                  requiredSkills={roleRequirements.requiredSkills}
                  roleName={selectedRole}
                  learningResources={learningResources}
                  loadingResources={loadingResources}
                />
                {missingSkills.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Study Plan Generator</CardTitle>
                      <CardDescription>
                        Generate a personalized study plan to fill your skill gaps
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <StudyPlanGenerator 
                        missingSkills={missingSkills} 
                        resources={learningResources}
                      />
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Complete Your Profile</CardTitle>
                  <CardDescription>
                    Add your skills and select a target role to see personalized learning resources
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => router.push("/profile")}>
                    Go to Profile
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="jobs" className="space-y-6">
            <JobPostingAnalyzer />
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
}
