"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface TypewriterProps {
  text: string;
  typingSpeed?: number;
  startDelay?: number;
  showCursor?: boolean;
  cursorCharacter?: string;
  cursorBlinkSpeed?: number;
  className?: string;
}

export function Typewriter({
  text,
  typingSpeed = 65,
  startDelay = 200,
  showCursor = true,
  cursorCharacter = "|",
  cursorBlinkSpeed = 500,
  className,
}: TypewriterProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let typeTimeout: ReturnType<typeof setTimeout>;
    let startTimeout: ReturnType<typeof setTimeout>;

    const typeCharacter = (index: number) => {
      if (!isMounted) {
        return;
      }

      if (index <= text.length) {
        setDisplayedText(text.slice(0, index));
        if (index < text.length) {
          typeTimeout = window.setTimeout(() => typeCharacter(index + 1), typingSpeed);
        }
      }
    };

    startTimeout = window.setTimeout(() => typeCharacter(1), startDelay);

    return () => {
      isMounted = false;
      window.clearTimeout(typeTimeout);
      window.clearTimeout(startTimeout);
    };
  }, [text, typingSpeed, startDelay]);

  useEffect(() => {
    if (!showCursor) {
      return;
    }

    const interval = window.setInterval(() => {
      setCursorVisible((prev) => !prev);
    }, cursorBlinkSpeed);

    return () => window.clearInterval(interval);
  }, [showCursor, cursorBlinkSpeed]);

  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-1 font-heading tracking-tight text-purple-800 dark:text-purple-100",
        className,
      )}
      aria-label={text}
    >
      <span>{displayedText}</span>
      {showCursor && (
        <span
          className={cn(
            "inline-block text-current transition-opacity duration-100",
            cursorVisible ? "opacity-100" : "opacity-0",
          )}
          aria-hidden="true"
        >
          {cursorCharacter}
        </span>
      )}
    </span>
  );
}

