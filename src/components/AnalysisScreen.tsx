"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface AnalysisScreenProps {
  wittyComment: string;
  onComplete: () => void;
}

export default function AnalysisScreen({
  wittyComment,
  onComplete,
}: AnalysisScreenProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const indexRef = useRef(0);
  const onCompleteRef = useRef(onComplete);

  // Keep the ref current
  onCompleteRef.current = onComplete;

  const startCompletion = useCallback(() => {
    setIsComplete(true);
    const timer = setTimeout(() => {
      onCompleteRef.current();
    }, 2000);
    return timer;
  }, []);

  // Typewriter effect
  useEffect(() => {
    if (!wittyComment) {
      startCompletion();
      return;
    }

    indexRef.current = 0;
    setDisplayedText("");
    setIsComplete(false);

    const interval = setInterval(() => {
      indexRef.current += 1;
      const next = wittyComment.slice(0, indexRef.current);
      setDisplayedText(next);

      if (indexRef.current >= wittyComment.length) {
        clearInterval(interval);
        startCompletion();
      }
    }, 40);

    return () => {
      clearInterval(interval);
    };
  }, [wittyComment, startCompletion]);

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50 px-6">
      {/* Glowing accent line */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-32 opacity-0"
        style={{
          background:
            "linear-gradient(to bottom, transparent, rgba(255,255,255,0.3), transparent)",
          animation: "accentReveal 1s ease-out 0.3s forwards",
        }}
      />

      <div className="relative z-10 max-w-2xl text-center animate-fade-in-up">
        {/* Typewriter text */}
        <p className="text-2xl font-light leading-relaxed text-white">
          {displayedText}
          {/* Blinking caret */}
          {!isComplete && (
            <span
              className="inline-block w-0.5 h-7 bg-white ml-1 align-middle"
              style={{ animation: "blink-caret 1s step-end infinite" }}
            />
          )}
        </p>

        {/* Subtle dot that appears after text is complete */}
        {isComplete && (
          <div className="mt-10 flex justify-center">
            <div
              className="w-2 h-2 rounded-full bg-white/40"
              style={{
                animation: "pulse-glow 2s ease-in-out infinite",
              }}
            />
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes accentReveal {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scaleY(0);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scaleY(1);
          }
        }
      `}</style>
    </div>
  );
}
