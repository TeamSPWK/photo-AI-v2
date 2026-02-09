"use client";

interface BillboardResultProps {
  image: string;
  message: string;
  isVideoLoading: boolean;
  onVideoReady?: () => void;
}

export default function BillboardResult({
  image,
  message,
  isVideoLoading,
}: BillboardResultProps) {
  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-12">
      {/* Billboard image container */}
      <div className="relative rounded-2xl overflow-hidden shadow-2xl animate-scale-in">
        {/* 16:9 aspect ratio container */}
        <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt="Your billboard"
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Shimmer overlay while video is loading */}
          {isVideoLoading && (
            <div className="absolute inset-0 shimmer pointer-events-none" />
          )}
        </div>
      </div>

      {/* Billboard message */}
      <div
        className="mt-8 text-center opacity-0 animate-fade-in-up"
        style={{ animationDelay: "0.5s" }}
      >
        <p className="text-xl font-light text-white leading-relaxed">
          {message}
        </p>
      </div>

      {/* Video loading indicator */}
      {isVideoLoading && (
        <div
          className="mt-10 flex flex-col items-center gap-4 opacity-0 animate-fade-in-up"
          style={{ animationDelay: "0.8s" }}
        >
          <div className="spinner-ring" />
          <p className="text-sm font-light text-gray-400 tracking-wide">
            Generating your billboard film...
          </p>
        </div>
      )}
    </div>
  );
}
