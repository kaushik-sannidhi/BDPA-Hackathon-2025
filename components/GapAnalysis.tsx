"use client";

import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ExternalLink, BookOpen, Video, FileText, Loader2 } from "lucide-react";
import { matchSkills, categorizeSkills } from "@/lib/skills";

interface LearningResource {
  title: string;
  url: string;
  platform: string;
  type: "Video" | "Interactive Course" | "Documentation";
}

interface GapAnalysisProps {
  userSkills: string[];
  requiredSkills: string[];
  roleName: string | null;
  learningResources: Record<string, LearningResource[]>;
  loadingResources: Set<string>;
}

export function GapAnalysis({
  userSkills,
  requiredSkills,
  roleName,
  learningResources,
  loadingResources,
}: GapAnalysisProps) {
  const { matched, missing, matchPercentage } = useMemo(
    () => matchSkills(userSkills, requiredSkills),
    [userSkills, requiredSkills]
  );

  const categorizedMissing = useMemo(() => categorizeSkills(missing), [missing]);
  const categorizedMatched = useMemo(() => categorizeSkills(matched), [matched]);

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "Video":
        return <Video className="h-4 w-4" />;
      case "Interactive Course":
        return <BookOpen className="h-4 w-4" />;
      case "Documentation":
        return <FileText className="h-4 w-4" />;
      default:
        return <ExternalLink className="h-4 w-4" />;
    }
  };

  if (!roleName) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Please select a target role to see gap analysis
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gap Analysis Results</CardTitle>
          <CardDescription>
            Your skills vs. requirements for {roleName}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Role Readiness</span>
              <span className="text-sm font-bold">{matchPercentage}%</span>
            </div>
            <Progress value={matchPercentage} className="h-3" />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-green-600">
                Matched Skills ({matched.length})
              </h3>
              <div className="space-y-3">
                {Object.entries(categorizedMatched).map(
                  ([category, skills]) =>
                    skills.length > 0 && (
                      <div key={category}>
                        <p className="text-sm font-medium text-muted-foreground mb-2">
                          {category.replace(/([A-Z])/g, " $1").trim()}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {skills.map((skill) => (
                            <Badge key={skill} variant="success">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 text-orange-600">
                Missing Skills ({missing.length})
              </h3>
              <div className="space-y-3">
                {Object.entries(categorizedMissing).map(
                  ([category, skills]) =>
                    skills.length > 0 && (
                      <div key={category}>
                        <p className="text-sm font-medium text-muted-foreground mb-2">
                          {category.replace(/([A-Z])/g, " $1").trim()}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {skills.map((skill) => (
                            <Badge key={skill} variant="warning">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {missing.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Learning Resources</CardTitle>
            <CardDescription>
              Recommended resources to fill your skill gaps
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingResources.size > 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading learning resources...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {missing.map((skill) => (
                  <div key={skill} className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-3">{skill}</h4>
                    {learningResources[skill]?.length > 0 ? (
                      <div className="space-y-2">
                        {learningResources[skill].map((resource, idx) => (
                          <a
                            key={idx}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-2 rounded hover:bg-accent transition-colors"
                          >
                            {getResourceIcon(resource.type)}
                            <div className="flex-1">
                              <p className="text-sm font-medium">
                                {resource.title}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {resource.platform} • {resource.type}
                              </p>
                            </div>
                            <ExternalLink className="h-4 w-4 text-muted-foreground" />
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No resources found
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}