"use client";

import { useState, useEffect } from "react";
import { JobPostingAnalyzer } from "@/components/JobPostingAnalyzer";
import { MarketInsights } from "@/components/MarketInsights";
import { StudyPlanGenerator } from "@/components/StudyPlanGenerator";
import { GapAnalysis } from "@/components/GapAnalysis";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { BookOpen, Briefcase, TrendingUp, Target } from "lucide-react";
import { matchSkills } from "@/lib/skills";

export default function ResourcesPage() {
  const router = useRouter();
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState("learning");
  
  const userSkills = userProfile?.skills || [];
  const selectedRole = userProfile?.selectedRole || null;
  const roleRequirements = userProfile?.roleRequirements || null;

  // Calculate missing skills for study plan
  const missingSkills = roleRequirements
    ? matchSkills(userSkills, roleRequirements.requiredSkills).missing
    : [];

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
                      <StudyPlanGenerator missingSkills={missingSkills} />
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

