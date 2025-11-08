"use client";

import Link from "next/link";
import { ArrowRight, Video, FileText, BarChart3, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="inline-block mb-6"
        >
          <Sparkles className="w-20 h-20 text-sky-500 mx-auto animate-glow-pulse" />
        </motion.div>
        <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-ink via-sky-600 to-ink bg-clip-text text-transparent glow-text">
          ApplAI
        </h1>
        <p className="text-xl text-ink/80 max-w-2xl mx-auto mb-8">
          Master your interview skills with AI-powered real-time coaching. Practice makes perfect,
          and we&apos;re here to help you apply.
        </p>
        <Link
          href="/interview"
          className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-sky-400 to-sky-600 text-white rounded-xl font-semibold text-lg shadow-glow-lg hover:shadow-glow-lg/80 transition-all duration-300 hover:scale-105 animate-glow-pulse"
        >
          Start Practice Session
          <ArrowRight className="w-5 h-5" />
        </Link>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8 mt-20">
        {[
          {
            icon: FileText,
            title: "Upload Resume",
            description: "Extract skills and keywords to personalize your practice questions",
            href: "/resume",
            color: "from-blue-400 to-cyan-500",
          },
          {
            icon: Video,
            title: "Mock Interview",
            description: "Real-time face tracking and coaching feedback during practice",
            href: "/interview",
            color: "from-cyan-400 to-sky-500",
          },
          {
            icon: BarChart3,
            title: "Review Sessions",
            description: "Analyze your performance with detailed metrics and AI insights",
            href: "/review",
            color: "from-sky-400 to-blue-500",
          },
        ].map((feature, idx) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: idx * 0.1 }}
          >
            <Link
              href={feature.href}
              className="block glass-effect rounded-2xl p-8 hover:shadow-glow-lg transition-all duration-300 group h-full"
            >
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-glow`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-ink group-hover:text-sky-600 transition-colors">
                {feature.title}
              </h3>
              <p className="text-ink/70 leading-relaxed">{feature.description}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

