"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export function RouteLoading() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const prevPathRef = useRef(pathname + searchParams.toString());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const exitTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const currentPath = pathname + searchParams.toString();
    
    // Only trigger if path actually changed
    if (currentPath !== prevPathRef.current) {
      // Clear any existing timeouts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (exitTimeoutRef.current) {
        clearTimeout(exitTimeoutRef.current);
        exitTimeoutRef.current = null;
      }
      
      // Reset states
      setIsExiting(false);
      setLoading(true);
      prevPathRef.current = currentPath;
      
      // Show for 1 second, then fade out
      timeoutRef.current = setTimeout(() => {
        setIsExiting(true);
        // After fade animation completes, hide the component
        exitTimeoutRef.current = setTimeout(() => {
          setLoading(false);
          setIsExiting(false);
        }, 300); // Match the fade duration
      }, 1000); // 1 second
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (exitTimeoutRef.current) {
        clearTimeout(exitTimeoutRef.current);
        exitTimeoutRef.current = null;
      }
    };
  }, [pathname, searchParams]);

  // Also listen for link clicks to show loading immediately
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href]');
      
      if (link) {
        const href = link.getAttribute('href');
        if (href && href.startsWith('/') && href !== pathname) {
          setIsExiting(false);
          setLoading(true);
        }
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [pathname]);

  return (
    <AnimatePresence mode="wait">
      {loading && (
        <motion.div
          key="loading-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: isExiting ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          onAnimationComplete={() => {
            if (isExiting) {
              setLoading(false);
            }
          }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: isExiting ? 0 : 1, scale: isExiting ? 0.9 : 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex flex-col items-center gap-4"
          >
            <div className="relative">
              <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
            </div>
            <p className="text-foreground text-lg font-medium">Loading...</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

