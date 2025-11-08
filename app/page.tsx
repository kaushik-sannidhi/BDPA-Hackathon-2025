"use client";

import Link from "next/link";
import { ArrowRight, Video, FileText, BarChart3 } from "lucide-react";
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
          <img 
            src="/assets/images/logo.svg" 
            alt="ApplAI Logo" 
            width={120} 
            height={120} 
            className="mx-auto"
          />
        </motion.div>
        <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-ink via-purple-500 to-ink bg-clip-text text-transparent glow-text">
          ApplAI
        </h1>
        <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
          Master your interview skills with AI-powered real-time coaching. Practice makes perfect,
          and we&apos;re here to help you apply.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8 mt-20">
        {[
          {
            icon: FileText,
            title: "Your Profile",
            description: "Manage your skills, target role, and resume to personalize your experience",
            href: "/profile",
            color: "from-purple-500 to-violet-600",
          },
          {
            icon: Video,
            title: "Mock Interview",
            description: "Real-time face tracking and coaching feedback during practice",
            href: "/interview",
            color: "from-violet-500 to-purple-600",
          },
          {
            icon: BarChart3,
            title: "Dashboard",
            description: "View your skill analysis, gap analysis, and career pathways",
            href: "/dashboard",
            color: "from-purple-600 to-violet-700",
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
              <h3 className="text-2xl font-bold mb-4 text-foreground group-hover:text-purple-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-foreground/70 leading-relaxed">{feature.description}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

