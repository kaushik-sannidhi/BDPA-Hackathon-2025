"use client";

import Link from "next/link";
import { ArrowRight, Video, FileText, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import GhostCursor from "@/components/GhostCursor";
import { Typewriter } from "@/components/Typewriter";

const featureSections = [
  {
    icon: FileText,
    title: "Your Profile",
    description:
      "Curate the story you want recruiters to see. Manage skills, tailor your target roles, and keep your resume in sync with the practice experience.",
    href: "/profile",
    gradient: "from-purple-400/16 via-fuchsia-500/14 to-violet-600/18",
    accent: "from-purple-400 via-fuchsia-500 to-violet-600",
  },
  {
    icon: Video,
    title: "Mock Interview",
    description:
      "Step into a premium mock interview room with real-time eye contact, presence, and voice coaching—exactly what judges want to experience.",
    href: "/interview",
    gradient: "from-violet-500/18 via-purple-600/16 to-fuchsia-600/14",
    accent: "from-fuchsia-500 via-purple-500 to-violet-500",
  },
  {
    icon: BarChart3,
    title: "Dashboard",
    description:
      "Translate practice into insights. Track momentum, uncover skill gaps, and surface the next best moves on a glowing analytics canvas.",
    href: "/dashboard",
    gradient: "from-purple-500/15 via-indigo-500/15 to-violet-700/18",
    accent: "from-violet-400 via-purple-500 to-indigo-500",
  },
];

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-16">
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="mb-28 flex justify-center"
      >
        <div className="relative isolate flex h-[560px] w-full max-w-6xl flex-col overflow-hidden rounded-[48px] border border-purple-200/40 bg-gradient-to-br from-white/80 via-purple-100/70 to-white/60 p-8 text-center shadow-[0_35px_90px_rgba(124,58,237,0.25)] backdrop-blur-2xl dark:border-white/10 dark:from-[#060318] dark:via-[#140c35] dark:to-[#1e1b4b] dark:shadow-[0_45px_120px_rgba(99,102,241,0.35)] md:p-16">
          <div className="pointer-events-none absolute inset-0 opacity-70">
            <GhostCursor
              color="#B19EEF"
              brightness={1}
              edgeIntensity={0.1}
              trailLength={60}
              inertia={0.55}
              grainIntensity={0.06}
              bloomStrength={0.18}
              bloomRadius={1.1}
              bloomThreshold={0.03}
              fadeDelayMs={1200}
              fadeDurationMs={1800}
              maxDevicePixelRatio={0.8}
            />
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#c4b5fd1f,transparent_65%)] dark:bg-[radial-gradient(circle_at_top,#7c3aed26,transparent_65%)]" />
          <div className="relative z-10 flex h-full flex-col items-center justify-center gap-10">
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 3.2, repeat: Infinity }}
              className="inline-flex h-32 w-32 items-center justify-center rounded-[28px] bg-gradient-to-br from-purple-500 via-fuchsia-500 to-purple-700 shadow-[0_30px_80px_rgba(147,51,234,0.45)]"
            >
              <img src="/assets/images/logo.svg" alt="ApplAI Logo" className="h-20 w-20" />
            </motion.div>
            <div className="space-y-6">
              <h1 className="font-heading text-6xl font-semibold tracking-tight text-purple-900 drop-shadow-[0_18px_70px_rgba(147,51,234,0.45)] dark:text-white">
                Passionfruit
              </h1>
              <Typewriter
                text="Pursue your passions and bear the fruit of your success!"
                typingSpeed={60}
                startDelay={250}
                cursorBlinkSpeed={360}
                className="justify-center text-2xl md:text-3xl text-purple-800 dark:text-purple-100"
              />
            </div>
          </div>
        </div>
      </motion.section>

      <div className="space-y-24">
        {featureSections.map((feature, index) => {
          const isReversed = index % 2 === 1;
          return (
            <motion.section
              key={feature.title}
              initial={{ opacity: 0, y: 80, x: isReversed ? 60 : -60 }}
              whileInView={{ opacity: 1, y: 0, x: 0 }}
              transition={{ duration: 0.75, ease: "easeOut" }}
              viewport={{ once: true, amount: 0.4 }}
              className="relative overflow-hidden rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-800 p-8 md:p-12"
            >
              <Link
                href={feature.href}
                className="group relative grid items-center gap-10 md:grid-cols-2"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
                  viewport={{ once: true, amount: 0.5 }}
                  className={`order-1 flex justify-center ${
                    isReversed
                      ? "md:order-2 md:justify-end"
                      : "md:order-1 md:justify-start"
                  }`}
                >
                  <div className="relative flex h-48 w-48 items-center justify-center rounded-[36px] border border-gray-200 bg-white text-purple-700 shadow-sm transition duration-300 hover:shadow-md dark:border-white/20 dark:bg-slate-700 dark:text-white">
                    <feature.icon className="h-20 w-20" />
                  </div>
                </motion.div>

                <div
                  className={`order-2 max-w-xl text-left ${
                    isReversed ? "md:order-1" : "md:order-2"
                  }`}
                >
                  <span className="inline-flex items-center gap-2 rounded-full border border-purple-200/60 bg-purple-100/40 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-purple-800/80 dark:border-white/20 dark:bg-white/10 dark:text-white/70">
                    {index + 1 < 10 ? `0${index + 1}` : index + 1} — Premium Feature
                  </span>
                  <h2 className="mt-6 font-heading text-4xl font-semibold text-slate-800 transition-colors duration-300 group-hover:text-purple-700 dark:text-white">
                    {feature.title}
                  </h2>
                  <p className="mt-4 text-lg leading-relaxed text-slate-700 dark:text-white/75">
                    {feature.description}
                  </p>

                  <div className="mt-8 inline-flex items-center gap-3 text-purple-600 transition-all duration-300 group-hover:text-purple-700 dark:text-purple-200/80 dark:group-hover:text-purple-100">
                    <span className="text-sm font-semibold uppercase tracking-[0.3em]">
                      Explore
                    </span>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-purple-300 bg-white transition-all duration-500 group-hover:translate-x-2 group-hover:border-purple-400 group-hover:bg-purple-50 dark:border-purple-200/20 dark:bg-white/5 dark:group-hover:border-purple-200/60">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.section>
          );
        })}
      </div>
    </div>
  );
}

