"use client";

import { useState, useEffect } from "react";
import { Dashboard } from "@/components/Dashboard";
import { GapAnalysis } from "@/components/GapAnalysis";
import { CareerPathways } from "@/components/CareerPathways";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { BarChart3, Target, TrendingUp, ArrowRight } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [roleRequirements, setRoleRequirements] = useState<{
    requiredSkills: string[];
    description: string;
    responsibilities: string[];
  } | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (userProfile) {
      setUserSkills(userProfile.skills || []);
      setSelectedRole(userProfile.selectedRole || null);
      setRoleRequirements(userProfile.roleRequirements || null);
    }
  }, [userProfile]);

  if (!userSkills.length && !selectedRole) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto px-4 py-12">
          <Card>
            <CardHeader>
              <CardTitle>Welcome to Your Dashboard</CardTitle>
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
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-foreground/70">
            Your comprehensive skill analysis and career readiness overview
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="career" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Career Pathways
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
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

          <TabsContent value="career" className="space-y-6">
            {userSkills.length > 0 ? (
              <CareerPathways currentSkills={userSkills} />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>No Skills Added</CardTitle>
                  <CardDescription>
                    Add your skills in your profile to see career pathway recommendations
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
        </Tabs>
      </div>
    </ProtectedRoute>
  );
}
