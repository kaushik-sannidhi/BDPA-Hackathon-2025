"use client";

import { useState, useEffect } from "react";
import { Play, Square, Loader2 } from "lucide-react";
import { CameraPanel } from "@/components/CameraPanel";
import { HudGauges } from "@/components/HudGauges";
import { QuestionQueue } from "@/components/QuestionQueue";
import { TipsToasts } from "@/components/TipsToasts";
import { ConsentDialog } from "@/components/ConsentDialog";
import { useAppStore, type SessionMetrics } from "@/lib/store";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function InterviewPage() {
  const router = useRouter();
  const {
    interviewState,
    setInterviewState,
    startSession,
    endSession,
    selectedRole,
    resumeSkills,
  } = useAppStore();
  const [currentMetrics, setCurrentMetrics] = useState<SessionMetrics | null>(null);
  const [consentGiven, setConsentGiven] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);

  useEffect(() => {
    if (interviewState === "reviewing") {
      router.push("/review");
    }
  }, [interviewState, router]);

  const handleStart = async () => {
    if (!consentGiven) {
      // Consent will be requested when camera starts
      // Allow the flow to continue
    }
    try {
      startSession(selectedRole, resumeSkills);
      setInterviewState("prepping");
      // Give time for camera to initialize
      setTimeout(() => {
        setInterviewState("live");
      }, 2000);
    } catch (error) {
      console.error("Error starting interview:", error);
      setInterviewState("idle");
    }
  };

  const handleStop = async () => {
    setInterviewState("reviewing");
    await endSession();
    router.push("/review");
  };

  const handleConsentAccept = () => {
    setConsentGiven(true);
  };

  const handleConsentDecline = () => {
    router.push("/");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {!consentGiven && <ConsentDialog onAccept={handleConsentAccept} onDecline={handleConsentDecline} />}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-2 text-foreground">Mock Interview</h1>
        <p className="text-foreground/70">Practice your interview skills with real-time AI coaching</p>
      </motion.div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={handleStart}
          disabled={interviewState === "live" || interviewState === "prepping"}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-lg font-semibold shadow-glow hover:shadow-glow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {interviewState === "prepping" ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Preparing...
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              Start Interview
            </>
          )}
        </button>
        {interviewState === "live" && (
          <button
            onClick={handleStop}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-400 to-rose-500 text-white rounded-lg font-semibold shadow-glow hover:shadow-glow-lg transition-all duration-300"
          >
            <Square className="w-5 h-5" />
            Stop Interview
          </button>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <CameraPanel onMetricsUpdate={setCurrentMetrics} />
          <HudGauges metrics={currentMetrics} />
        </div>
        <div className="lg:col-span-1">
          <QuestionQueue role={selectedRole} onQuestionSelect={setSelectedQuestion} />
          {selectedQuestion && interviewState === "live" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 glass-effect rounded-xl p-4 border-2 border-purple-500"
            >
              <div className="text-sm font-semibold text-foreground/60 mb-2">Current Question:</div>
              <div className="text-foreground font-medium">{selectedQuestion}</div>
            </motion.div>
          )}
        </div>
      </div>

      {interviewState === "live" && <TipsToasts metrics={currentMetrics} />}
    </div>
  );
}

