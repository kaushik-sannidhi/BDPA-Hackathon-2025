"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, Clock, DollarSign, Target } from "lucide-react";

interface CareerPathway {
  targetRole: string;
  whyFit: string;
  requiredAdditionalSkills: string[];
  timeline: string;
  salaryProgression: string;
  growthOpportunities: string[];
}

interface CareerPathwaysProps {
  currentSkills: string[];
  interests?: string[];
  experience?: number;
}

export function CareerPathways({ 
  currentSkills, 
  interests = [], 
  experience = 0 
}: CareerPathwaysProps) {
  const [pathways, setPathways] = useState<CareerPathway[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentSkills.length > 0) {
      fetchPathways();
    }
  }, [currentSkills]);

  const fetchPathways = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/career/pathways", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentSkills,
          interests,
          experience,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPathways(data.pathways || []);
      }
    } catch (error) {
      console.error("Error fetching career pathways:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (pathways.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            No career pathways found. Try adding more skills.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {pathways.map((pathway, idx) => (
        <Card key={idx} className="border-2 hover:border-primary transition-colors">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl mb-2">{pathway.targetRole}</CardTitle>
                <CardDescription className="text-base">{pathway.whyFit}</CardDescription>
              </div>
              <Badge variant="default" className="ml-4">
                Pathway {idx + 1}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Additional Skills Needed
              </h4>
              <div className="flex flex-wrap gap-2">
                {pathway.requiredAdditionalSkills.map((skill, skillIdx) => (
                  <Badge key={skillIdx} variant="outline">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-start gap-2">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Timeline</p>
                  <p className="text-sm text-muted-foreground">{pathway.timeline}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Salary Progression</p>
                  <p className="text-sm text-muted-foreground">{pathway.salaryProgression}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <TrendingUp className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Growth</p>
                  <p className="text-sm text-muted-foreground">High Potential</p>
                </div>
              </div>
            </div>

            {pathway.growthOpportunities.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Growth Opportunities</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  {pathway.growthOpportunities.map((opp, oppIdx) => (
                    <li key={oppIdx}>{opp}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

