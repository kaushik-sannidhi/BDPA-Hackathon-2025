"use client";

import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis } from "recharts";
import { matchSkills, categorizeSkills } from "@/lib/skills";
import { MarketInsights } from "@/components/MarketInsights";
import { StudyPlanGenerator } from "@/components/StudyPlanGenerator";

interface DashboardProps {
  userSkills: string[];
  requiredSkills: string[];
  roleName: string | null;
}

const COLORS = ["#10b981", "#f59e0b", "#ef4444"];

export function Dashboard({ userSkills, requiredSkills, roleName }: DashboardProps) {
  if (!roleName || requiredSkills.length === 0) {
    return null;
  }

  // Memoize matching computation — it's pure and potentially expensive
  const matchResult = useMemo(() => matchSkills(userSkills, requiredSkills), [userSkills, requiredSkills]);
  const { matched, missing, matchPercentage } = matchResult;

  const total = requiredSkills.length;

  const chartData = useMemo(() => [
    { name: "Matched", value: matched.length, color: COLORS[0] },
    { name: "Missing", value: missing.length, color: COLORS[1] },
  ], [matched.length, missing.length]);

  const categorizedMissing = useMemo(() => categorizeSkills(missing), [missing]);
  const categoryData = useMemo(() => [
    { category: "Languages", matched: categorizedMissing.programmingLanguages.length },
    { category: "Frameworks", matched: categorizedMissing.frameworks.length },
    { category: "Tools", matched: categorizedMissing.tools.length },
    { category: "Soft Skills", matched: categorizedMissing.softSkills.length },
  ], [categorizedMissing]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Skills Overview</CardTitle>
          <CardDescription>Visual breakdown of your skill match</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Total Required Skills</span>
                <span className="text-sm font-bold">{total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-green-600">Matched Skills</span>
                <span className="text-sm font-bold text-green-600">{matched.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-orange-600">Missing Skills</span>
                <span className="text-sm font-bold text-orange-600">{missing.length}</span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg font-semibold">Readiness Score</span>
                <span className="text-2xl font-bold text-primary">{matchPercentage}%</span>
              </div>
              <p className="text-sm text-muted-foreground">
                You have {matchPercentage}% of the required skills for {roleName}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <div className="grid md:grid-cols-2 gap-6 mt-6">
      <Card>
        <CardHeader>
          <CardTitle>Missing Skills by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="matched" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <MarketInsights role={roleName} />
    </div>

    {missing.length > 0 && (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Study Plan Generator</CardTitle>
          <CardDescription>
            Create a personalized learning schedule for your missing skills
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StudyPlanGenerator missingSkills={missing} />
        </CardContent>
      </Card>
    )}
  </div>
  );
}
