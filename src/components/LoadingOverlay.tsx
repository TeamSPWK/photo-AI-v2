"use client";

import { useState, useEffect, useRef } from "react";

const DEFAULT_MESSAGES = [
  "당신의 아우라를 분석하고 있습니다...",
  "최고의 광고 배경을 선정하고 있습니다...",
  "전광판에 올릴 걸작을 만들고 있습니다...",
  "당신만의 특별한 광고를 제작 중입니다...",
];

interface LoadingOverlayProps {
  messages?: string[];
}

export default function LoadingOverlay({ messages }: LoadingOverlayProps) {
  const loadingMessages = messages && messages.length > 0 ? messages : DEFAULT_MESSAGES;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fadeState, setFadeState] = useState<"in" | "out">("in");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      // Fade out
      setFadeState("out");

      // After fade-out, change message and fade in
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % loadingMessages.length);
        setFadeState("in");
      }, 400);
    }, 3000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [loadingMessages.length]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center glass-strong">
      {/* Spinner */}
      <div className="spinner-ring mb-10" />

      {/* Rotating message */}
      <p
        className="text-lg font-light text-gray-300 text-center px-6 max-w-md transition-opacity duration-400"
        style={{
          opacity: fadeState === "in" ? 1 : 0,
          transitionDuration: "400ms",
        }}
      >
        {loadingMessages[currentIndex]}
      </p>
    </div>
  );
}
