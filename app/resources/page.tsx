"use client";

import { useState, useEffect, useMemo } from "react";
import { JobPostingAnalyzer } from "@/components/JobPostingAnalyzer";
import { MarketInsights } from "@/components/MarketInsights";
import { StudyPlanGenerator } from "@/components/StudyPlanGenerator";
import { GapAnalysis } from "@/components/GapAnalysis";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { BookOpen, Briefcase, TrendingUp } from "lucide-react";
import { matchSkills } from "@/lib/skills";

export default function ResourcesPage() {
  const router = useRouter();
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState("learning");
  
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

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Resources</h1>
          <p className="text-foreground/70">
            Access learning resources, analyze job postings, and explore market insights
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="learning" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Learning
            </TabsTrigger>
            <TabsTrigger value="jobs" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Job Analyzer
            </TabsTrigger>
            <TabsTrigger value="market" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Market Insights
            </TabsTrigger>
          </TabsList>

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
                  <button
                    onClick={() => router.push("/profile")}
                    className="px-4 py-2 bg-purple-500/30 text-foreground rounded-lg hover:bg-purple-500/40 transition-colors"
                  >
                    Go to Profile
                  </button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="jobs" className="space-y-6">
            <JobPostingAnalyzer />
          </TabsContent>

          <TabsContent value="market" className="space-y-6">
            {selectedRole ? (
              <MarketInsights role={selectedRole} />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Select a Role</CardTitle>
                  <CardDescription>
                    Select a target role in your profile to see market insights
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <button
                    onClick={() => router.push("/profile")}
                    className="px-4 py-2 bg-purple-500/30 text-foreground rounded-lg hover:bg-purple-500/40 transition-colors"
                  >
                    Go to Profile
                  </button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
}