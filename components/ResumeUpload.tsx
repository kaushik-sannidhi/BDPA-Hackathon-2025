"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, File, X, Loader2, Sparkles, ThumbsUp, ThumbsDown, Lightbulb } from "lucide-react";

interface ResumeUploadProps {
  onResumeParsed: (text: string) => void;
  onSkillsExtracted?: (skills: string[]) => void;
  resumeText: string;
  selectedRole: string | null;
}

interface Analysis {
  strengths: string[];
  weaknesses: string[];
  growthTips: {
    tip: string;
    link?: string;
  }[];
}

export function ResumeUpload({
  onResumeParsed,
  onSkillsExtracted,
  resumeText,
  selectedRole,
}: ResumeUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (uploadedFile: File) => {
    setFile(uploadedFile);
    setError(null);
    setAnalysis(null);
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append("file", uploadedFile);

      const parseResponse = await fetch("/api/parse-resume", {
        method: "POST",
        body: formData,
      });

      if (!parseResponse.ok) {
        throw new Error("Failed to parse resume");
      }

      const { text } = await parseResponse.json();
      onResumeParsed(text);

      if (onSkillsExtracted) {
        const response = await fetch("/api/extract-skills", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resumeText: text }),
        });

        if (response.ok) {
          const { skills } = await response.json();
          onSkillsExtracted(skills);
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to process resume"
      );
    } finally {
      setIsProcessing(false);
    }
  }, [onResumeParsed, onSkillsExtracted]);

  const handleAnalyze = async () => {
    if (!resumeText || !selectedRole) {
      setError("Please upload a resume and select a target role first.");
      return;
    }
    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);

    try {
      const response = await fetch("/api/resume-evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, role: selectedRole }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to analyze resume");
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to analyze resume"
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  const removeFile = () => {
    setFile(null);
    setError(null);
    setAnalysis(null);
    onResumeParsed("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
              transition-colors
              ${
                isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50"
              }
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileChange}
              className="hidden"
            />
            {isProcessing ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  Processing resume...
                </p>
              </div>
            ) : file ? (
              <div className="flex flex-col items-center gap-2">
                <File className="h-8 w-8 text-primary" />
                <p className="text-sm font-medium">{file.name}</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile();
                  }}
                >
                  <X className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium">
                  {isDragActive
                    ? "Drop your resume here"
                    : "Drag & drop your resume, or click to select"}
                </p>
                <p className="text-xs text-muted-foreground">
                  PDF, Word, or Text files
                </p>
              </div>
            )}
          </div>

          {resumeText && (
            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !selectedRole}
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Analyze Resume
                </>
              )}
            </Button>
          )}
          {!selectedRole && resumeText && (
            <p className="text-xs text-center text-amber-500">
              Please select a target role to enable analysis.
            </p>
          )}

          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {analysis && (
            <div className="space-y-6 pt-4">
              <h3 className="text-xl font-semibold text-center">Resume Analysis</h3>
              
              {/* Strengths */}
              <div>
                <h4 className="font-semibold text-lg flex items-center gap-2 mb-2 text-green-500">
                  <ThumbsUp /> Strengths
                </h4>
                <ul className="list-disc list-inside space-y-1 pl-2">
                  {analysis.strengths.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses */}
              <div>
                <h4 className="font-semibold text-lg flex items-center gap-2 mb-2 text-red-500">
                  <ThumbsDown /> Weaknesses
                </h4>
                <ul className="list-disc list-inside space-y-1 pl-2">
                  {analysis.weaknesses.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Growth Tips */}
              <div>
                <h4 className="font-semibold text-lg flex items-center gap-2 mb-2 text-blue-500">
                  <Lightbulb /> Growth Tips
                </h4>
                <ul className="list-disc list-inside space-y-2 pl-2">
                  {analysis.growthTips.map((item, index) => (
                    <li key={index}>
                      {item.tip}
                      {item.link && (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-primary hover:underline text-sm"
                        >
                          Learn more
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

