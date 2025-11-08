"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from "recharts";
import { type SessionSummary } from "@/lib/store";
import { motion } from "framer-motion";

interface SummaryChartsProps {
  session: SessionSummary;
}

export function SummaryCharts({ session }: SummaryChartsProps) {
  const chartData = session.metrics.map((metric, index) => ({
    time: `${Math.floor((metric.timestamp - session.startTime) / 1000)}s`,
    "Eye Contact": metric.eyeContact,
    Smile: metric.smile,
    Posture: metric.posture,
    Speaking: metric.speakingRatio,
  }));

  const averages = {
    eyeContact: Math.round(session.metrics.reduce((sum, m) => sum + m.eyeContact, 0) / session.metrics.length || 0),
    smile: Math.round(session.metrics.reduce((sum, m) => sum + m.smile, 0) / session.metrics.length || 0),
    posture: Math.round(session.metrics.reduce((sum, m) => sum + m.posture, 0) / session.metrics.length || 0),
    speakingRatio: Math.round(session.metrics.reduce((sum, m) => sum + m.speakingRatio, 0) / session.metrics.length || 0),
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect rounded-2xl p-6"
      >
        <h3 className="text-2xl font-bold mb-6 text-foreground">Performance Timeline</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="time" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" domain={[0, 100]} />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(15, 23, 42, 0.95)",
                border: "1px solid rgba(168, 85, 247, 0.3)",
                borderRadius: "8px",
                color: "#f1f5f9",
              }}
            />
            <Legend wrapperStyle={{ color: "#f1f5f9" }} />
            <Area
              type="monotone"
              dataKey="Eye Contact"
              stackId="1"
              stroke="#a855f7"
              fill="#a855f7"
              fillOpacity={0.6}
            />
            <Area
              type="monotone"
              dataKey="Smile"
              stackId="2"
              stroke="#c084fc"
              fill="#c084fc"
              fillOpacity={0.6}
            />
            <Area
              type="monotone"
              dataKey="Posture"
              stackId="3"
              stroke="#9333ea"
              fill="#9333ea"
              fillOpacity={0.6}
            />
            <Area
              type="monotone"
              dataKey="Speaking"
              stackId="4"
              stroke="#d8b4fe"
              fill="#d8b4fe"
              fillOpacity={0.6}
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid md:grid-cols-2 gap-6"
      >
        <div className="glass-effect rounded-2xl p-6">
          <h4 className="text-lg font-bold mb-4 text-foreground">Average Scores</h4>
          <div className="space-y-4">
            {Object.entries(averages).map(([key, value]) => (
              <div key={key}>
                <div className="flex justify-between mb-2">
                  <span className="text-foreground/70 capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                  <span className="font-bold text-foreground">{value}%</span>
                </div>
                <div className="h-2 bg-foreground/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-500 to-violet-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-effect rounded-2xl p-6">
          <h4 className="text-lg font-bold mb-4 text-foreground">Session Info</h4>
          <div className="space-y-3 text-foreground/80">
            <div>
              <span className="font-semibold">Duration:</span>{" "}
              {Math.floor(session.duration / 1000 / 60)}m {Math.floor((session.duration / 1000) % 60)}s
            </div>
            <div>
              <span className="font-semibold">Role:</span> {session.role}
            </div>
            <div>
              <span className="font-semibold">Skills:</span> {session.skills.join(", ") || "None"}
            </div>
            <div>
              <span className="font-semibold">Data Points:</span> {session.metrics.length}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

