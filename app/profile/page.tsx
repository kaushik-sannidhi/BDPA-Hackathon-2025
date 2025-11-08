"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { SkillInput } from "@/components/SkillInput";
import { RoleSelection } from "@/components/RoleSelection";
import { ResumeUpload } from "@/components/ResumeUpload";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { updateUserSkills, updateUserRole, updateUserResume } from "@/lib/firebase/realtime";
import { debounce } from "@/lib/utils/debounce";
import { User, Briefcase, FileText, CheckCircle2 } from "lucide-react";

export default function ProfilePage() {
  const { user, userProfile } = useAuth();
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [roleRequirements, setRoleRequirements] = useState<{
    requiredSkills: string[];
    description: string;
    responsibilities: string[];
  } | null>(null);
  const [resumeText, setResumeText] = useState<string>("");
  const [isInitialized, setIsInitialized] = useState(false);
  const [activeTab, setActiveTab] = useState("skills");

  // Initialize from userProfile
  useEffect(() => {
    if (userProfile && !isInitialized) {
      setUserSkills(userProfile.skills || []);
      setSelectedRole(userProfile.selectedRole || null);
      setRoleRequirements(userProfile.roleRequirements || null);
      setResumeText(userProfile.resumeText || "");
      setIsInitialized(true);
    }
  }, [userProfile, isInitialized]);

  // Debounced update functions
  const debouncedUpdateSkills = useMemo(
    () =>
      debounce(async (skills: string[]) => {
        if (user) {
          await updateUserSkills(user.uid, skills);
        }
      }, 1000),
    [user]
  );

  const debouncedUpdateResume = useMemo(
    () =>
      debounce(async (text: string) => {
        if (user) {
          await updateUserResume(user.uid, text);
        }
      }, 1000),
    [user]
  );

  // Update Firestore with debounce
  useEffect(() => {
    if (user && isInitialized && userSkills.length >= 0) {
      debouncedUpdateSkills(userSkills);
    }
  }, [userSkills, user, isInitialized, debouncedUpdateSkills]);

  useEffect(() => {
    if (user && isInitialized && resumeText) {
      debouncedUpdateResume(resumeText);
    }
  }, [resumeText, user, isInitialized, debouncedUpdateResume]);

  const handleSkillsChange = useCallback((skills: string[]) => {
    setUserSkills(skills);
  }, []);

  const handleRoleSelect = async (role: string) => {
    setSelectedRole(role);
    try {
      const response = await fetch("/api/role-requirements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleName: role }),
      });
      const data = await response.json();
      const requirements = {
        requiredSkills: data.requiredSkills || [],
        description: data.description || "",
        responsibilities: data.responsibilities || [],
      };
      setRoleRequirements(requirements);
      if (user) {
        await updateUserRole(user.uid, role, requirements);
      }
    } catch (error) {
      console.error("Error loading role requirements:", error);
    }
  };

  const handleResumeParsed = useCallback((text: string) => {
    setResumeText(text);
  }, []);

  const handleSkillsExtracted = useCallback((skills: string[]) => {
    setUserSkills((prev) => {
      const combined = [...new Set([...prev, ...skills])];
      return combined;
    });
    setActiveTab("skills");
  }, []);

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Your Profile</h1>
          <p className="text-foreground/70">
            Manage your skills, target role, and resume to personalize your experience
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="skills" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Skills
            </TabsTrigger>
            <TabsTrigger value="role" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Target Role
            </TabsTrigger>
            <TabsTrigger value="resume" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Resume
            </TabsTrigger>
          </TabsList>

          <TabsContent value="skills" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Skills</CardTitle>
                <CardDescription>
                  Add your technical and professional skills. You can also upload your resume to auto-extract skills.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SkillInput skills={userSkills} onSkillsChange={handleSkillsChange} />
                {userSkills.length > 0 && (
                  <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-foreground/80">
                      {userSkills.length} skill{userSkills.length !== 1 ? "s" : ""} saved
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="role" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Target Role</CardTitle>
                <CardDescription>
                  Select your target role to see personalized requirements and gap analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RoleSelection
                  selectedRole={selectedRole}
                  onRoleSelect={handleRoleSelect}
                  onRequirementsLoaded={setRoleRequirements}
                />
                {selectedRole && roleRequirements?.requiredSkills && (
                  <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                    <h3 className="font-semibold mb-2">{selectedRole}</h3>
                    <p className="text-sm text-foreground/70 mb-3">{roleRequirements.description}</p>
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Required Skills:</h4>
                      <div className="flex flex-wrap gap-2">
                        {roleRequirements.requiredSkills?.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-purple-500/20 rounded text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resume" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Resume Upload</CardTitle>
                <CardDescription>
                  Upload your resume to extract skills and text. The resume will be saved to your profile.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResumeUpload
                  onResumeParsed={handleResumeParsed}
                  onSkillsExtracted={handleSkillsExtracted}
                />
                {resumeText && (
                  <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <h3 className="font-semibold mb-2">Resume Text Extracted</h3>
                    <p className="text-sm text-foreground/70 line-clamp-3">{resumeText.substring(0, 200)}...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-8 p-4 glass-effect rounded-lg">
          <h3 className="font-semibold mb-2">Profile Summary</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-foreground/70">Skills:</span>{" "}
              <span className="font-medium">{userSkills.length}</span>
            </div>
            <div>
              <span className="text-foreground/70">Target Role:</span>{" "}
              <span className="font-medium">{selectedRole || "Not set"}</span>
            </div>
            <div>
              <span className="text-foreground/70">Resume:</span>{" "}
              <span className="font-medium">{resumeText ? "Uploaded" : "Not uploaded"}</span>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

