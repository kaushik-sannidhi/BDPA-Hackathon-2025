"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, DollarSign, MapPin, Laptop, BarChart3 } from "lucide-react";

interface MarketInsightsProps {
  role: string;
}

interface MarketInsightsData {
  inDemandSkills: string[];
  emergingTechnologies: string[];
  salaryRanges: {
    entry: string;
    mid: string;
    senior: string;
  };
  geographicDemand: string;
  remoteWorkAvailability: string;
  growthRate: string;
}

export function MarketInsights({ role }: MarketInsightsProps) {
  const [insights, setInsights] = useState<MarketInsightsData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (role) {
      fetchInsights();
    }
  }, [role]);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/market/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });

      if (response.ok) {
        const data = await response.json();
        setInsights(data);
      }
    } catch (error) {
      console.error("Error fetching market insights:", error);
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

  // Initialize with default values if insights is null
  const defaultSalaryRanges = { 
    entry: 'N/A', 
    mid: 'N/A', 
    senior: 'N/A' 
  };
  
  const safeInsights = {
    inDemandSkills: insights?.inDemandSkills || [],
    emergingTechnologies: insights?.emergingTechnologies || [],
    salaryRanges: insights?.salaryRanges || defaultSalaryRanges,
    geographicDemand: insights?.geographicDemand || 'N/A',
    remoteWorkAvailability: insights?.remoteWorkAvailability || 'N/A',
    growthRate: insights?.growthRate || 'N/A'
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Market Insights for {role}
          </CardTitle>
          <CardDescription>Real-time job market trends and data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Top In-Demand Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {safeInsights.inDemandSkills?.map((skill, idx) => (
                <Badge key={idx} variant="default">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Emerging Technologies</h3>
            <div className="flex flex-wrap gap-2">
              {safeInsights.emergingTechnologies?.map((tech, idx) => (
                <Badge key={idx} variant="outline">
                  {tech}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-start gap-2">
              <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium">Entry Level</div>
                <div className="text-xl font-bold">{safeInsights.salaryRanges.entry}</div>
                <p className="text-xs text-muted-foreground">Mid: {safeInsights.salaryRanges.mid}</p>
                <p className="text-xs text-muted-foreground">Senior: {safeInsights.salaryRanges.senior}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Geographic Demand</p>
                <div className="text-2xl font-bold">{safeInsights.geographicDemand}</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Laptop className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Remote Work</p>
                <div className="text-2xl font-bold">{safeInsights.remoteWorkAvailability}</div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Industry Growth Rate</h3>
            <div className="text-2xl font-bold">{safeInsights.growthRate}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

