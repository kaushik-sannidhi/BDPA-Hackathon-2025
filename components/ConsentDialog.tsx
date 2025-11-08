"use client";

import { useState } from "react";
import { Shield, Video, Mic } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ConsentDialogProps {
  onAccept: () => void;
  onDecline: () => void;
}

export function ConsentDialog({ onAccept, onDecline }: ConsentDialogProps) {
  const [isOpen, setIsOpen] = useState(true);

  const handleAccept = () => {
    setIsOpen(false);
    setTimeout(() => {
      onAccept();
    }, 100);
  };

  const handleDecline = () => {
    setIsOpen(false);
    setTimeout(() => {
      onDecline();
    }, 100);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="glass-effect rounded-2xl p-8 max-w-md mx-4 shadow-glow-lg"
          >
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-glow">
                <Shield className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center mb-4 text-foreground">Privacy & Consent</h2>
            <div className="space-y-4 mb-6 text-foreground/80">
              <div className="flex items-start gap-3">
                <Video className="w-5 h-5 mt-0.5 text-purple-500 flex-shrink-0" />
                <p className="text-sm">
                  We need access to your camera and microphone for the interview practice session.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 mt-0.5 text-purple-500 flex-shrink-0" />
                <p className="text-sm">
                  <strong>Important:</strong> All video and audio processing happens in your browser.
                  No video or audio is ever uploaded to our servers.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Mic className="w-5 h-5 mt-0.5 text-purple-500 flex-shrink-0" />
                <p className="text-sm">
                  We only analyze audio levels and patterns. No audio recordings are saved.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleDecline}
                className="flex-1 px-6 py-3 rounded-lg bg-foreground/10 text-foreground font-medium hover:bg-foreground/20 transition-colors"
              >
                Decline
              </button>
              <button
                onClick={handleAccept}
                className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-violet-600 text-white font-semibold shadow-glow hover:shadow-glow-lg transition-all duration-300"
              >
                I Understand, Continue
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

