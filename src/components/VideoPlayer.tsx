"use client";

import { useRef, useState } from "react";

interface VideoPlayerProps {
  videoUrl: string;
}

export default function VideoPlayer({ videoUrl }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-12 animate-crossfade">
      {/* Header label */}
      <p className="text-sm tracking-widest uppercase text-gray-400 text-center mb-6 font-light">
        Your Billboard is Live
      </p>

      {/* Video container */}
      <div
        className="relative rounded-2xl overflow-hidden shadow-2xl"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
          <video
            ref={videoRef}
            src={videoUrl}
            autoPlay
            loop
            muted
            playsInline
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-300 ${
              isHovering ? "" : ""
            }`}
            controls={isHovering}
          />

          {/* Subtle overlay gradient for controls visibility when hovering */}
          {isHovering && (
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
          )}
        </div>
      </div>
    </div>
  );
}
