"use client";

import { useEffect, useState } from "react";

interface IntroScreenProps {
  onStart: () => void;
}

export default function IntroScreen({ onStart }: IntroScreenProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden">
      {/* Animated gradient orb background */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full opacity-20 blur-[120px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 40%, transparent 70%)",
          animation: "orbFloat 8s ease-in-out infinite",
        }}
      />
      <div
        className="absolute w-[300px] h-[300px] rounded-full opacity-10 blur-[80px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)",
          animation: "orbFloat 6s ease-in-out infinite reverse",
          animationDelay: "2s",
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-2xl">
        {/* Headline */}
        <h1
          className={`text-7xl font-extralight tracking-tight text-white mb-4 opacity-0 ${
            mounted ? "animate-fade-in-up" : ""
          }`}
        >
          Wave<span className="font-medium">Port</span>
        </h1>

        {/* Slogan */}
        <p
          className={`text-lg text-gray-400 font-light tracking-widest uppercase mb-16 opacity-0 ${
            mounted ? "animate-fade-in-up" : ""
          }`}
          style={{ animationDelay: "0.2s" }}
        >
          Your Presence, The New ImpactWave.
        </p>

        {/* CTA Button */}
        <div
          className={`opacity-0 ${mounted ? "animate-fade-in-up" : ""}`}
          style={{ animationDelay: "0.5s" }}
        >
          <button
            onClick={onStart}
            className="glass rounded-full px-10 py-4 text-white text-lg font-light tracking-wide border border-white/20 transition-all duration-500 hover:border-white/50 hover:bg-white/10 cursor-pointer"
            style={{
              animation: "pulse-glow 3s ease-in-out infinite",
            }}
          >
            Take a Shot
          </button>
        </div>
      </div>

      {/* Inline keyframes for the orb animation */}
      <style jsx>{`
        @keyframes orbFloat {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -40px) scale(1.05);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.95);
          }
        }
      `}</style>
    </div>
  );
}
