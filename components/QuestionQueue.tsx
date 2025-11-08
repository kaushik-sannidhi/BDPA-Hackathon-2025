"use client";

import { useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const QUESTION_SETS: Record<string, string[]> = {
  Frontend: [
    "Tell me about yourself.",
    "What is your experience with React?",
    "How do you handle state management in large applications?",
    "Describe a challenging bug you've fixed.",
    "How do you ensure your code is accessible?",
    "What's your approach to testing frontend code?",
  ],
  "C/C++ Systems": [
    "Tell me about yourself.",
    "Explain memory management in C++.",
    "What's the difference between a pointer and a reference?",
    "Describe a time you optimized performance-critical code.",
    "How do you debug memory leaks?",
    "What's your experience with multithreading?",
  ],
  "Data Science": [
    "Tell me about yourself.",
    "Walk me through a data science project you've worked on.",
    "How do you handle missing data?",
    "Explain overfitting and how you prevent it.",
    "Describe your experience with machine learning models.",
    "How do you communicate insights to non-technical stakeholders?",
  ],
  General: [
    "Tell me about yourself.",
    "What are your strengths?",
    "What's your biggest weakness?",
    "Why do you want to work here?",
    "Where do you see yourself in 5 years?",
    "Describe a time you worked in a team.",
  ],
};

interface QuestionQueueProps {
  role: string;
  onQuestionSelect?: (question: string) => void;
}

export function QuestionQueue({ role, onQuestionSelect }: QuestionQueueProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answered, setAnswered] = useState<Set<number>>(new Set());
  const questions = QUESTION_SETS[role] || QUESTION_SETS.General;

  const handleQuestionClick = (index: number) => {
    setCurrentIndex(index);
    onQuestionSelect?.(questions[index]);
  };

  const markAnswered = (index: number) => {
    setAnswered(new Set([...answered, index]));
  };

  return (
    <div className="glass-effect rounded-2xl p-6 h-full">
      <h3 className="text-xl font-bold mb-4 text-ink">Interview Questions</h3>
      <div className="space-y-3 max-h-[500px] overflow-y-auto">
        <AnimatePresence mode="wait">
          {questions.map((question, index) => {
            const isCurrent = index === currentIndex;
            const isAnswered = answered.has(index);

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onClick={() => handleQuestionClick(index)}
                className={`p-4 rounded-lg cursor-pointer transition-all duration-300 ${
                  isCurrent
                    ? "bg-gradient-to-r from-sky-400/30 to-blue-400/30 shadow-glow border-2 border-sky-400"
                    : "bg-white/50 hover:bg-white/70 border-2 border-transparent"
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markAnswered(index);
                    }}
                    className="mt-1 flex-shrink-0"
                  >
                    {isAnswered ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-ink/40" />
                    )}
                  </button>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-ink/60 mb-1">
                      Question {index + 1}
                    </div>
                    <div className="text-ink font-medium">{question}</div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

