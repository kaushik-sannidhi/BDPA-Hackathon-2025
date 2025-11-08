"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const commonRoles = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Scientist",
  "DevOps Engineer",
  "Mobile Developer",
  "UI/UX Designer",
  "Software Engineer",
  "Machine Learning Engineer",
  "Cloud Engineer",
];

interface RoleSelectionProps {
  selectedRole: string | null;
  onRoleSelect: (role: string) => void;
  onRequirementsLoaded?: (requirements: {
    requiredSkills: string[];
    description: string;
    responsibilities: string[];
  }) => void;
}

export function RoleSelection({
  selectedRole,
  onRoleSelect,
  onRequirementsLoaded,
}: RoleSelectionProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleRoleClick = async (role: string) => {
    if (selectedRole === role) return;

    setLoading(role);
    onRoleSelect(role);

    try {
      const response = await fetch("/api/role-requirements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleName: role }),
      });

      if (response.ok && onRequirementsLoaded) {
        const requirements = await response.json();
        onRequirementsLoaded(requirements);
      }
    } catch (error) {
      console.error("Error loading role requirements:", error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Target Role</CardTitle>
        <CardDescription>
          Choose the role you want to prepare for
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {commonRoles.map((role) => (
            <Button
              key={role}
              variant={selectedRole === role ? "default" : "outline"}
              onClick={() => handleRoleClick(role)}
              disabled={loading === role}
              className="h-auto py-3 px-4 text-sm"
            >
              {loading === role ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {role}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

