"use client";

import { useEffect, useState } from "react";
import { useAppStore, type SessionSummary } from "@/lib/store";
import { SummaryCharts } from "@/components/SummaryCharts";
import { motion } from "framer-motion";
import { CheckCircle2, Lightbulb, Target, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ReviewPage() {
  const router = useRouter();
  const { sessions, loadSessions, deleteAllSessions, currentSession } = useAppStore();
  const [selectedSession, setSelectedSession] = useState<SessionSummary | null>(null);
  const [feedback, setFeedback] = useState<{ bullets: string[]; tips: string[] } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  useEffect(() => {
    // Use current session if available, otherwise use most recent
    if (currentSession) {
      setSelectedSession(currentSession);
      fetchFeedback(currentSession);
    } else if (sessions.length > 0) {
      const latest = sessions[sessions.length - 1];
      setSelectedSession(latest);
      fetchFeedback(latest);
    }
  }, [currentSession, sessions]);

  const fetchFeedback = async (session: SessionSummary) => {
    setLoading(true);
    try {
      const response = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signalsSummary: {
            eyeContact: session.metrics.reduce((sum, m) => sum + m.eyeContact, 0) / session.metrics.length,
            smile: session.metrics.reduce((sum, m) => sum + m.smile, 0) / session.metrics.length,
            posture: session.metrics.reduce((sum, m) => sum + m.posture, 0) / session.metrics.length,
            speakingRatio: session.metrics.reduce((sum, m) => sum + m.speakingRatio, 0) / session.metrics.length,
            fillerWords: session.metrics.reduce((sum, m) => sum + m.fillerWords, 0) / session.metrics.length,
          },
          role: session.role,
          skills: session.skills,
        }),
      });

      const data = await response.json();
      setFeedback(data);
    } catch (error) {
      console.error("Failed to fetch feedback:", error);
      setFeedback({
        bullets: ["Unable to generate feedback at this time."],
        tips: ["Try again later or check your connection."],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAll = async () => {
    if (confirm("Are you sure you want to delete all session data? This cannot be undone.")) {
      await deleteAllSessions();
      setSelectedSession(null);
      setFeedback(null);
    }
  };

  if (sessions.length === 0 && !currentSession) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect rounded-2xl p-12 max-w-md mx-auto"
        >
          <h2 className="text-2xl font-bold mb-4 text-foreground">No Sessions Yet</h2>
          <p className="text-foreground/70 mb-6">Complete an interview practice session to see your review here.</p>
          <button
            onClick={() => router.push("/interview")}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-lg font-semibold shadow-glow hover:shadow-glow-lg transition-all duration-300"
          >
            Start Practice Session
          </button>
        </motion.div>
      </div>
    );
  }

  const sessionToShow = selectedSession || currentSession || sessions[sessions.length - 1];

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold mb-2 text-foreground">Session Review</h1>
          <p className="text-foreground/70">Analyze your performance and get personalized feedback</p>
        </div>
        <button
          onClick={handleDeleteAll}
          className="flex items-center gap-2 px-4 py-2 bg-red-900/30 text-red-400 rounded-lg font-medium hover:bg-red-900/50 transition-colors border border-red-800/50"
        >
          <Trash2 className="w-4 h-4" />
          Delete All Data
        </button>
      </motion.div>

      {sessionToShow && (
        <>
          <SummaryCharts session={sessionToShow} />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 glass-effect rounded-2xl p-8"
          >
            <h2 className="text-2xl font-bold mb-6 text-foreground flex items-center gap-3">
              <Lightbulb className="w-6 h-6 text-purple-500" />
              AI Coaching Feedback
            </h2>

            {loading ? (
              <div className="text-center py-8 text-foreground/70">Generating feedback...</div>
            ) : feedback ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-foreground flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-purple-500" />
                    Performance Summary
                  </h3>
                  <ul className="space-y-2">
                    {feedback.bullets.map((bullet, idx) => (
                      <li key={idx} className="text-foreground/80 flex items-start gap-2">
                        <span className="text-purple-500 mt-1">•</span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3 text-foreground flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-500" />
                    Actionable Tips
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    {feedback.tips.map((tip, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + idx * 0.1 }}
                        className="p-4 bg-gradient-to-br from-purple-900/30 to-violet-900/30 rounded-lg border border-purple-800/50"
                      >
                        <div className="text-sm font-semibold text-purple-400 mb-1">Tip {idx + 1}</div>
                        <div className="text-foreground">{tip}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-foreground/70">No feedback available</div>
            )}
          </motion.div>
        </>
      )}

      {sessions.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 glass-effect rounded-2xl p-6"
        >
          <h3 className="text-lg font-bold mb-4 text-foreground">Previous Sessions</h3>
          <div className="space-y-2">
            {sessions.slice(0, 5).map((session) => (
              <button
                key={session.id}
                onClick={() => {
                  setSelectedSession(session);
                  fetchFeedback(session);
                }}
                className={`w-full text-left p-4 rounded-lg transition-all ${
                  selectedSession?.id === session.id
                    ? "bg-purple-500/30 border-2 border-purple-500"
                    : "bg-white/5 hover:bg-white/10 border-2 border-transparent"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-foreground">{session.role}</div>
                    <div className="text-sm text-foreground/70">
                      {new Date(session.startTime).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-sm text-foreground/70">
                    {Math.floor(session.duration / 1000 / 60)}m
                  </div>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

