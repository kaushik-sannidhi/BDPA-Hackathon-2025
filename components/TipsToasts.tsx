"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Lightbulb } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { type SessionMetrics } from "@/lib/store";

interface Tip {
  id: string;
  message: string;
  type: "info" | "warning" | "success";
}

interface TipsToastsProps {
  metrics: SessionMetrics | null;
}

export function TipsToasts({ metrics }: TipsToastsProps) {
  const [tips, setTips] = useState<Tip[]>([]);

  useEffect(() => {
    if (!metrics) return;

    const newTips: Tip[] = [];

    // Eye contact tips
    if (metrics.eyeContact < 50) {
      newTips.push({
        id: `eye-${Date.now()}`,
        message: "Try to maintain better eye contact with the camera",
        type: "warning",
      });
    } else if (metrics.eyeContact > 80) {
      newTips.push({
        id: `eye-good-${Date.now()}`,
        message: "Great eye contact! Keep it up",
        type: "success",
      });
    }

    // Smile tips
    if (metrics.smile < 30) {
      newTips.push({
        id: `smile-${Date.now()}`,
        message: "Remember to smile - it shows confidence!",
        type: "info",
      });
    }

    // Posture tips
    if (metrics.posture < 60) {
      newTips.push({
        id: `posture-${Date.now()}`,
        message: "Sit up straight and face the camera",
        type: "warning",
      });
    }

    // Speaking tips
    if (metrics.speakingRatio < 30) {
      newTips.push({
        id: `speaking-${Date.now()}`,
        message: "Try to speak more - don't be too quiet",
        type: "info",
      });
    } else if (metrics.speakingRatio > 90) {
      newTips.push({
        id: `speaking-fast-${Date.now()}`,
        message: "Slow down a bit - take pauses between thoughts",
        type: "warning",
      });
    }

    // Filler words
    if (metrics.fillerWords > 5) {
      newTips.push({
        id: `filler-${Date.now()}`,
        message: "Try to reduce filler words like 'um' and 'uh'",
        type: "info",
      });
    }

    // Only add new tips if they're different from existing ones
    setTips((prev) => {
      const existingMessages = new Set(prev.map((t) => t.message));
      const uniqueNewTips = newTips.filter((tip) => !existingMessages.has(tip.message));
      return [...prev, ...uniqueNewTips].slice(-5); // Keep only last 5
    });
  }, [metrics]);

  const removeTip = (id: string) => {
    setTips((prev) => prev.filter((tip) => tip.id !== id));
  };

  const getIcon = (type: Tip["type"]) => {
    switch (type) {
      case "success":
        return CheckCircle2;
      case "warning":
        return AlertCircle;
      default:
        return Lightbulb;
    }
  };

  const getColor = (type: Tip["type"]) => {
    switch (type) {
      case "success":
        return "from-purple-500 to-violet-600";
      case "warning":
        return "from-yellow-500 to-orange-500";
      default:
        return "from-purple-500 to-violet-600";
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
      <AnimatePresence>
        {tips.map((tip) => {
          const Icon = getIcon(tip.type);
          return (
            <motion.div
              key={tip.id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className={`glass-effect rounded-lg p-4 shadow-glow border-l-4 bg-gradient-to-r ${getColor(tip.type)}/10 border-${tip.type === "success" ? "purple" : tip.type === "warning" ? "yellow" : "purple"}-500`}
            >
              <div className="flex items-start gap-3">
                <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                  tip.type === "success" ? "text-purple-500" : tip.type === "warning" ? "text-yellow-500" : "text-purple-500"
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{tip.message}</p>
                </div>
                <button
                  onClick={() => removeTip(tip.id)}
                  className="text-foreground/40 hover:text-foreground transition-colors"
                >
                  ×
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

