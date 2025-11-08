"use client";

import { Eye, Smile, Headphones, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { type SessionMetrics } from "@/lib/store";

interface HudGaugesProps {
  metrics: SessionMetrics | null;
}

export function HudGauges({ metrics }: HudGaugesProps) {
  const gaugeData = [
    {
      label: "Eye Contact",
      value: metrics?.eyeContact ?? 0,
      icon: Eye,
      color: "from-purple-500 to-violet-600",
    },
    {
      label: "Smile",
      value: metrics?.smile ?? 0,
      icon: Smile,
      color: "from-violet-500 to-purple-600",
    },
    {
      label: "Posture",
      value: metrics?.posture ?? 0,
      icon: Headphones,
      color: "from-purple-600 to-violet-700",
    },
    {
      label: "Speaking",
      value: metrics?.speakingRatio ?? 0,
      icon: MessageSquare,
      color: "from-violet-600 to-purple-700",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {gaugeData.map((gauge, idx) => (
        <motion.div
          key={gauge.label}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: idx * 0.1 }}
          className="glass-effect rounded-xl p-6 text-center hover:shadow-glow transition-all duration-300"
        >
          <div className="flex justify-center mb-3">
            <div
              className={`w-12 h-12 rounded-full bg-gradient-to-br ${gauge.color} flex items-center justify-center shadow-glow`}
            >
              <gauge.icon className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-3xl font-bold mb-2 text-foreground">{gauge.value}%</div>
          <div className="text-sm text-foreground/70 font-medium">{gauge.label}</div>
          <div className="mt-3 h-2 bg-foreground/10 rounded-full overflow-hidden">
            <motion.div
              className={`h-full bg-gradient-to-r ${gauge.color} rounded-full`}
              initial={{ width: 0 }}
              animate={{ width: `${gauge.value}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>
      ))}
      {metrics && metrics.fillerWords > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="col-span-2 md:col-span-4 glass-effect rounded-xl p-4 text-center"
        >
          <div className="text-sm text-foreground/70">
            Filler Words: <span className="font-semibold text-foreground">{metrics.fillerWords}</span> per
            minute
          </div>
        </motion.div>
      )}
    </div>
  );
}

