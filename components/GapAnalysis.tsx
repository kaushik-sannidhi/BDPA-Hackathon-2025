"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ExternalLink, BookOpen, Video, FileText } from "lucide-react";
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
}

export function GapAnalysis({
  userSkills,
  requiredSkills,
  roleName,
}: GapAnalysisProps) {
  const [missingSkills, setMissingSkills] = useState<string[]>([]);
  const [matchedSkills, setMatchedSkills] = useState<string[]>([]);
  const [matchPercentage, setMatchPercentage] = useState(0);
  const [learningResources, setLearningResources] = useState<
    Record<string, LearningResource[]>
  >({});
  const [loadingResources, setLoadingResources] = useState<Set<string>>(
    new Set()
  );

  // Ref cache to avoid re-fetching and to read latest cache inside async loops
  const resourcesRef = useRef<Record<string, LearningResource[]>>(learningResources);
  useEffect(() => {
    resourcesRef.current = learningResources;
  }, [learningResources]);

  useEffect(() => {
    if (requiredSkills.length === 0) return;

    const { matched, missing, matchPercentage } = matchSkills(
      userSkills,
      requiredSkills
    );
    setMatchedSkills(matched);
    setMissingSkills(missing);
    setMatchPercentage(matchPercentage);
  }, [userSkills, requiredSkills]);

  useEffect(() => {
    if (missingSkills.length === 0) return;

    let isMounted = true;
    const controller = new AbortController();

    const fetchForSkill = async (skill: string) => {
      // Skip if already cached
      if (resourcesRef.current && resourcesRef.current[skill]) return;

      // Mark loading
      setLoadingResources((prev) => new Set(prev).add(skill));

      try {
        const response = await fetch("/api/learning-resources", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ skill }),
          signal: controller.signal,
        });

        if (!isMounted || controller.signal.aborted) return;

        if (response.ok) {
          const { resources } = await response.json();
          // Update both ref and state using functional update
          setLearningResources((prev) => {
            const next = { ...prev, [skill]: resources || [] };
            resourcesRef.current = next;
            return next;
          });
        }
      } catch (error) {
        if ((error as any)?.name === "AbortError") {
          // aborted
        } else {
          console.error(`Error fetching resources for ${skill}:`, error);
        }
      } finally {
        // Avoid returning inside finally — only update state if still mounted
        if (isMounted) {
          setLoadingResources((prev) => {
            const next = new Set(prev);
            next.delete(skill);
            return next;
          });
        }
      }
    };

    // Fire off fetches for missing skills that are not cached yet.
    for (const skill of missingSkills) {
      if (!resourcesRef.current || !resourcesRef.current[skill]) {
        fetchForSkill(skill);
      }
    }

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [missingSkills]);

  // Memoize categorizations to avoid recompute on every render
  const categorizedMissing = useMemo(() => categorizeSkills(missingSkills), [missingSkills]);
  const categorizedMatched = useMemo(() => categorizeSkills(matchedSkills), [matchedSkills]);

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
                Matched Skills ({matchedSkills.length})
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
                Missing Skills ({missingSkills.length})
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

      {missingSkills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Learning Resources</CardTitle>
            <CardDescription>
              Recommended resources to fill your skill gaps
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {missingSkills.map((skill) => (
                <div key={skill} className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-3">{skill}</h4>
                  {loadingResources.has(skill) ? (
                    <p className="text-sm text-muted-foreground">
                      Loading resources...
                    </p>
                  ) : learningResources[skill]?.length > 0 ? (
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}
