"use client";

import { useEffect, useRef, useCallback, useState } from "react";

interface CameraCaptureProps {
  onCapture: (imageDataUrl: string) => void;
  onCancel: () => void;
}

export default function CameraCapture({
  onCapture,
  onCancel,
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user",
          },
        });

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            setReady(true);
          };
        }
      } catch {
        if (!cancelled) {
          setError("Could not access camera. Please check your permissions.");
        }
      }
    }

    startCamera();

    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, []);

  const doCapture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Flash effect
    setFlash(true);
    setTimeout(() => setFlash(false), 300);

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);

    // Stop the stream before calling back
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    setTimeout(() => onCapture(dataUrl), 350);
  }, [onCapture]);

  const handleCapture = useCallback(() => {
    if (!ready || countdown !== null) return;

    // Start countdown: 3, 2, 1
    setCountdown(3);

    let count = 3;
    const interval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
      } else {
        setCountdown(null);
        clearInterval(interval);
        doCapture();
      }
    }, 1000);
  }, [ready, countdown, doCapture]);

  if (error) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 px-6">
        <p className="text-white text-xl font-light mb-8 text-center">
          {error}
        </p>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-white transition-colors text-lg"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 px-6">
      {/* Viewfinder */}
      <div className="relative w-full max-w-2xl animate-fade-in-up">
        {/* Cinematic white frame */}
        <div className="relative rounded-2xl border border-white/20 overflow-hidden shadow-2xl">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full block bg-black"
            style={{ maxHeight: "80vh" }}
          />

          {/* Countdown overlay */}
          {countdown !== null && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <span className="text-white text-8xl font-extralight animate-scale-in" key={countdown}>
                {countdown}
              </span>
            </div>
          )}

          {/* Flash effect */}
          {flash && (
            <div className="absolute inset-0 bg-white animate-crossfade pointer-events-none" />
          )}

          {/* Corner accents */}
          <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-white/40 rounded-tl" />
          <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-white/40 rounded-tr" />
          <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-white/40 rounded-bl" />
          <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-white/40 rounded-br" />
        </div>
      </div>

      {/* Controls */}
      <div
        className="mt-10 flex flex-col items-center gap-6 animate-fade-in-up"
        style={{ animationDelay: "0.2s" }}
      >
        {/* Cancel */}
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-300 transition-colors text-sm tracking-wide"
        >
          Cancel
        </button>

        {/* Capture button */}
        <button
          onClick={handleCapture}
          disabled={!ready || countdown !== null}
          className="relative w-20 h-20 rounded-full border-4 border-white/80 flex items-center justify-center transition-all duration-300 hover:border-white hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          aria-label="Capture photo"
        >
          <div className="w-14 h-14 rounded-full bg-white/90 transition-all duration-150 hover:bg-white active:bg-white/70" />
        </button>
      </div>

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
