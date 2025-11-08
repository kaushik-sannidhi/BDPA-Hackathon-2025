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
        <h3 className="text-2xl font-bold mb-6 text-ink">Performance Timeline</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="time" stroke="#666" />
            <YAxis stroke="#666" domain={[0, 100]} />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                border: "1px solid rgba(135, 206, 235, 0.3)",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="Eye Contact"
              stackId="1"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.6}
            />
            <Area
              type="monotone"
              dataKey="Smile"
              stackId="2"
              stroke="#06b6d4"
              fill="#06b6d4"
              fillOpacity={0.6}
            />
            <Area
              type="monotone"
              dataKey="Posture"
              stackId="3"
              stroke="#0ea5e9"
              fill="#0ea5e9"
              fillOpacity={0.6}
            />
            <Area
              type="monotone"
              dataKey="Speaking"
              stackId="4"
              stroke="#8b5cf6"
              fill="#8b5cf6"
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
          <h4 className="text-lg font-bold mb-4 text-ink">Average Scores</h4>
          <div className="space-y-4">
            {Object.entries(averages).map(([key, value]) => (
              <div key={key}>
                <div className="flex justify-between mb-2">
                  <span className="text-ink/70 capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                  <span className="font-bold text-ink">{value}%</span>
                </div>
                <div className="h-2 bg-ink/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-sky-400 to-blue-500 rounded-full"
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
          <h4 className="text-lg font-bold mb-4 text-ink">Session Info</h4>
          <div className="space-y-3 text-ink/80">
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

