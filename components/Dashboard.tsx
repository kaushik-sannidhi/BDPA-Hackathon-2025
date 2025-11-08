"use client";

import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis } from "recharts";
import { Badge } from "@/components/ui/badge";
import { matchSkills, categorizeSkills } from "@/lib/skills";
import { MarketInsights } from "@/components/MarketInsights";

interface DashboardProps {
  userSkills: string[];
  requiredSkills?: string[];
  roleName: string | null;
}

const COLORS = ["#10b981", "#f59e0b", "#ef4444"];

export function Dashboard({ userSkills, requiredSkills, roleName }: DashboardProps) {
  if (!roleName || !requiredSkills || requiredSkills.length === 0) {
    return null;
  }

  const { matched, missing, matchPercentage } = useMemo(
    () => matchSkills(userSkills, requiredSkills),
    [userSkills, requiredSkills]
  );

  const total = requiredSkills.length;

  const chartData = useMemo(() => [
    { name: "Matched", value: matched.length, color: COLORS[0] },
    { name: "Missing", value: missing.length, color: COLORS[1] },
  ], [matched.length, missing.length]);

  const categorizedMissing = useMemo(() => categorizeSkills(missing), [missing]);
  const categorizedMatched = useMemo(() => categorizeSkills(matched), [matched]);

  const categoryData = useMemo(() => [
    { category: "Languages", matched: categorizedMatched.programmingLanguages.length, notMatched: categorizedMissing.programmingLanguages.length },
    { category: "Frameworks", matched: categorizedMatched.frameworks.length, notMatched: categorizedMissing.frameworks.length },
    { category: "Tools", matched: categorizedMatched.tools.length, notMatched: categorizedMissing.tools.length },
    { category: "Soft Skills", matched: categorizedMatched.softSkills.length, notMatched: categorizedMissing.softSkills.length },
  ], [categorizedMatched, categorizedMissing]);

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
        <div className="grid md:grid-cols-2 gap-6 pt-6 border-t">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-green-500">
                Your Matched Skills ({matched.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {matched.map((skill) => (
                  <Badge key={skill} variant="success">{skill}</Badge>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3 text-yellow-500">
                Missing Skills ({missing.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {missing.map((skill) => (
                  <Badge key={skill} variant="warning">{skill}</Badge>
                ))}
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
              <YAxis 
                tickFormatter={(value) => Math.round(value).toString()}
                domain={[0, 5]}
                ticks={[0, 1, 2, 3, 4, 5]}
                tickCount={6}
              />
              <Tooltip />
              <Bar dataKey="notMatched" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <MarketInsights role={roleName} />
    </div>
  </div>
  );
}
