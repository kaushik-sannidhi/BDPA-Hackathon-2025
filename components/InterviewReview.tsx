"use client";

import { useEffect, useState, useMemo } from "react";
import { useAppStore, AnswerRecord } from "@/lib/store";
import { LoadingScreen } from "@/components/LoadingScreen";
import { motion } from "framer-motion";
import { CheckCircle2, Lightbulb, Target, Trash2, BarChart2, Star, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

export function InterviewReview() {
  const { answeredQuestions, loadAnsweredQuestions, deleteAllAnsweredQuestions } = useAppStore();
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);

  useEffect(() => {
    loadAnsweredQuestions();
  }, [loadAnsweredQuestions]);

  const sortedAnswers = useMemo(() => {
    return [...answeredQuestions].sort((a, b) => b.timestamp - a.timestamp);
  }, [answeredQuestions]);

  const selectedAnswer = useMemo(() => {
    return sortedAnswers.find(a => a.id === selectedAnswerId) || sortedAnswers[0] || null;
  }, [sortedAnswers, selectedAnswerId]);

  const handleDeleteAll = async () => {
    if (confirm("Are you sure you want to delete all interview reports? This cannot be undone.")) {
      await deleteAllAnsweredQuestions();
    }
  };

  const aggregateStats = useMemo(() => {
    if (answeredQuestions.length === 0) {
      return { averageScore: 0, totalQuestions: 0, roles: [] };
    }
    const totalScore = answeredQuestions.reduce((sum, ans) => sum + ans.feedback.overallScore, 0);
    const roles = [...new Set(answeredQuestions.map(a => a.role))];
    return {
      averageScore: totalScore / answeredQuestions.length,
      totalQuestions: answeredQuestions.length,
      roles,
    };
  }, [answeredQuestions]);

  if (sortedAnswers.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect rounded-2xl p-12 max-w-md mx-auto"
        >
          <h2 className="text-2xl font-bold mb-4 text-foreground">No Reports Yet</h2>
          <p className="text-foreground/70 mb-6">Complete an interview question to see your reports here.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2 text-foreground">Interview Reports</h1>
          <p className="text-foreground/70">Analyze your performance across all questions.</p>
        </div>
        <Button variant="destructive" onClick={handleDeleteAll}>
          <Trash2 className="w-4 h-4 mr-2" />
          Delete All Reports
        </Button>
      </motion.div>

      {/* Aggregate Stats */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{aggregateStats.averageScore.toFixed(1)} / 10</div>
                <p className="text-xs text-muted-foreground">across {aggregateStats.totalQuestions} questions</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Questions Answered</CardTitle>
                <BarChart2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{aggregateStats.totalQuestions}</div>
                <p className="text-xs text-muted-foreground">for roles like {aggregateStats.roles.slice(0,2).join(', ')}</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Last Practice</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{new Date(sortedAnswers[0].timestamp).toLocaleDateString()}</div>
                <p className="text-xs text-muted-foreground">Keep up the great work!</p>
            </CardContent>
        </Card>
      </div>
      
      {/* Score Over Time Chart */}
      <Card className="mb-6">
        <CardHeader>
            <CardTitle>Score History</CardTitle>
            <CardDescription>Your score for each question answered over time.</CardDescription>
        </CardHeader>
        <CardContent>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sortedAnswers.map(a => ({ name: `Q${a.id.slice(-4)}`, score: a.feedback.score }))}>
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false}/>
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} domain={[0, 10]}/>
                    <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151" }} />
                    <Bar dataKey="score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Details View */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
            <Card>
                <CardHeader>
                    <CardTitle>Answer History</CardTitle>
                    <CardDescription>Select an answer to see details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
                    {sortedAnswers.map(answer => (
                        <button key={answer.id} onClick={() => setSelectedAnswerId(answer.id)} className={`w-full text-left p-3 rounded-lg transition-all ${selectedAnswer?.id === answer.id ? "bg-primary/20 border-primary border" : "hover:bg-accent/50"}`}>
                            <p className="font-semibold truncate">{answer.question}</p>
                            <p className="text-sm text-muted-foreground">{new Date(answer.timestamp).toLocaleString()}</p>
                        </button>
                    ))}
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-2">
            {selectedAnswer ? (
                <Card>
                    <CardHeader>
                        <CardTitle className="truncate">{selectedAnswer.question}</CardTitle>
                        <CardDescription>Report for answer on {new Date(selectedAnswer.timestamp).toLocaleString()}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {selectedAnswer.videoUrl && <video controls className="w-full rounded-lg" src={selectedAnswer.videoUrl} />}
                        
                        <div className="p-4 bg-background/50 rounded-lg">
                            <h4 className="font-semibold mb-2">Your Transcript</h4>
                            <p className="text-sm text-muted-foreground italic">"{selectedAnswer.transcript}"</p>
                        </div>

                        <div className="space-y-3">
                            <h4 className="font-semibold mb-2">Rubric Scores</h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                {selectedAnswer.feedback.rubricScores && Object.entries(selectedAnswer.feedback.rubricScores).map(([criterion, score]) => (
                                    <div key={criterion} className="flex justify-between">
                                        <span className="capitalize">{criterion.replace(/([A-Z])/g, ' $1')}</span>
                                        <span className="font-bold">{score}/5</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h4 className="font-semibold">Strengths</h4>
                            <ul className="list-disc list-inside text-sm">{selectedAnswer.feedback.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>
                        </div>
                        <div className="space-y-3">
                            <h4 className="font-semibold">Weaknesses</h4>
                            <ul className="list-disc list-inside text-sm">{selectedAnswer.feedback.weaknesses.map((w, i) => <li key={i}>{w}</li>)}</ul>
                        </div>
                        <div className="space-y-3">
                            <h4 className="font-semibold">Suggestions</h4>
                            <ul className="list-disc list-inside text-sm">{selectedAnswer.feedback.suggestions.map((s, i) => <li key={i}>{s}</li>)}</ul>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Card className="flex items-center justify-center h-full">
                    <CardContent><p className="text-muted-foreground">Select an answer to view its report.</p></CardContent>
                </Card>
            )}
        </div>
      </div>
    </>
  );
}
