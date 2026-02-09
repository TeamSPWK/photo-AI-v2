"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import IntroScreen from "@/components/IntroScreen";
import CameraCapture from "@/components/CameraCapture";
import AnalysisScreen from "@/components/AnalysisScreen";
import BillboardResult from "@/components/BillboardResult";
import VideoPlayer from "@/components/VideoPlayer";
import LoadingOverlay from "@/components/LoadingOverlay";

type AppStep =
  | "INIT"
  | "INTRO"
  | "CAMERA"
  | "ANALYZING"
  | "ANALYSIS_DISPLAY"
  | "FACESWAP_LOADING"
  | "BILLBOARD"
  | "VIDEO_PENDING"
  | "VIDEO_READY";

interface TemplateInfo {
  filename: string;
  personCount: number;
  mood: string;
  colors: string;
  aspectRatio: string;
  description: string;
}

interface AnalysisResult {
  wittyComment: string;
  selectedTemplate: string;
  billboardMessage: string;
}

const FACESWAP_LOADING_MESSAGES = [
  "당신만의 전광판을 제작하고 있습니다...",
  "AI가 걸작을 만들고 있습니다...",
  "거의 완성되었습니다. 잠시만 기다려주세요...",
  "전광판의 주인공이 될 준비를 하고 있습니다...",
];

export default function Home() {
  // ── State ───────────────────────────────────────────────────────────
  const [step, setStep] = useState<AppStep>("INIT");
  const [templates, setTemplates] = useState<TemplateInfo[]>([]);
  const [userImage, setUserImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [billboardImage, setBillboardImage] = useState<string | null>(null);
  const [billboardMessage, setBillboardMessage] = useState<string>("");
  const [videoTaskId, setVideoTaskId] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // ── Init: fetch templates ────────────────────────────────────────────
  useEffect(() => {
    async function init() {
      try {
        const res = await fetch("/api/analyze-templates", { method: "POST" });
        if (!res.ok) throw new Error("Failed to load templates");
        const data = await res.json();
        setTemplates(data.templates || []);
      } catch {
        // Templates are optional -- we can proceed without them
        // The backend can select from pre-analyzed templates
      }
      setStep("INTRO");
    }

    init();
  }, []);

  // ── Polling for video status ─────────────────────────────────────────
  useEffect(() => {
    if (
      (step !== "BILLBOARD" && step !== "VIDEO_PENDING") ||
      !videoTaskId
    ) {
      return;
    }

    async function pollVideo() {
      try {
        const res = await fetch(`/api/video-status/${videoTaskId}`);
        if (!res.ok) return;
        const data = await res.json();

        if (data.status === "SUCCEEDED" && data.videoUrl) {
          setVideoUrl(data.videoUrl);
          setStep("VIDEO_READY");

          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
        } else if (data.status === "FAILED") {
          // Video failed, but billboard is still showing -- silently stop polling
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
        }
      } catch {
        // Polling error -- will retry on next interval
      }
    }

    pollingRef.current = setInterval(pollVideo, 5000);

    // Also poll immediately
    pollVideo();

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [step, videoTaskId]);

  // ── Handlers ─────────────────────────────────────────────────────────
  const handleStart = useCallback(() => {
    setError(null);
    setStep("CAMERA");
  }, []);

  const handleCapture = useCallback(async (imageDataUrl: string) => {
    setUserImage(imageDataUrl);
    setStep("ANALYZING");
    setError(null);

    try {
      const res = await fetch("/api/analyze-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userImage: imageDataUrl }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Analysis failed");
      }

      const data = await res.json();

      const analysisData = data.analysis || data;
      setAnalysis({
        wittyComment: analysisData.wittyComment || "You were born for this.",
        selectedTemplate: analysisData.selectedTemplate?.filename || analysisData.selectedTemplate || "",
        billboardMessage: analysisData.billboardMessage || "",
      });

      setStep("ANALYSIS_DISPLAY");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    }
  }, []);

  const handleCameraCancel = useCallback(() => {
    setStep("INTRO");
  }, []);

  const handleAnalysisComplete = useCallback(async () => {
    if (!analysis || !userImage) return;

    setStep("FACESWAP_LOADING");
    setError(null);

    try {
      const res = await fetch("/api/faceswap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userImage,
          templateFilename: analysis.selectedTemplate,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Face swap failed");
      }

      const data = await res.json();

      if (!data.success || !data.image) {
        throw new Error("No billboard image was generated");
      }

      setBillboardImage(data.image);
      setBillboardMessage(
        analysis.billboardMessage || "Your billboard moment."
      );
      setStep("BILLBOARD");

      // Start video generation in background
      try {
        const analysisInfo = analysis;
        const videoRes = await fetch("/api/generate-video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image: data.image,
            userMood: analysisInfo?.wittyComment ? "luxury" : "elegant",
            userDescription: data.billboardMessage || "a striking billboard advertisement",
          }),
        });

        if (videoRes.ok) {
          const videoData = await videoRes.json();
          if (videoData.taskId) {
            setVideoTaskId(videoData.taskId);
            setStep("VIDEO_PENDING");
          }
        }
      } catch {
        // Video generation is optional -- billboard is already showing
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    }
  }, [analysis, userImage]);

  const handleStartOver = useCallback(() => {
    // Clean up all state
    setStep("INTRO");
    setUserImage(null);
    setAnalysis(null);
    setBillboardImage(null);
    setBillboardMessage("");
    setVideoTaskId(null);
    setVideoUrl(null);
    setError(null);

    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const handleRetry = useCallback(() => {
    setError(null);
    // Determine where to retry from
    if (step === "ANALYZING" || step === "ANALYSIS_DISPLAY") {
      if (userImage) {
        handleCapture(userImage);
      } else {
        setStep("CAMERA");
      }
    } else if (step === "FACESWAP_LOADING") {
      if (analysis && userImage) {
        handleAnalysisComplete();
      } else {
        setStep("CAMERA");
      }
    } else {
      setStep("INTRO");
    }
  }, [step, userImage, analysis, handleCapture, handleAnalysisComplete]);

  // ── Error screen ─────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-6">
        <div className="glass rounded-2xl p-10 max-w-md w-full text-center animate-scale-in">
          <div className="w-12 h-12 rounded-full border-2 border-red-400/50 flex items-center justify-center mx-auto mb-6">
            <span className="text-red-400 text-xl font-light">!</span>
          </div>
          <p className="text-white text-lg font-light mb-2">
            Something went wrong
          </p>
          <p className="text-gray-400 text-sm mb-8 leading-relaxed">
            {error}
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={handleRetry}
              className="w-full py-3 rounded-full border border-white/20 text-white text-sm font-light tracking-wide hover:bg-white/10 transition-colors cursor-pointer"
            >
              Try Again
            </button>
            <button
              onClick={handleStartOver}
              className="w-full py-3 text-gray-500 text-sm font-light hover:text-gray-300 transition-colors cursor-pointer"
            >
              Start Over
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-black">
      {/* INIT state: blank black screen while loading */}
      {step === "INIT" && (
        <div className="min-h-screen bg-black" />
      )}

      {/* INTRO */}
      {step === "INTRO" && <IntroScreen onStart={handleStart} />}

      {/* CAMERA */}
      {step === "CAMERA" && (
        <CameraCapture onCapture={handleCapture} onCancel={handleCameraCancel} />
      )}

      {/* ANALYZING: loading overlay while calling analyze-user API */}
      {step === "ANALYZING" && <LoadingOverlay />}

      {/* ANALYSIS_DISPLAY: show witty comment with typewriter effect */}
      {step === "ANALYSIS_DISPLAY" && analysis && (
        <AnalysisScreen
          wittyComment={analysis.wittyComment}
          onComplete={handleAnalysisComplete}
        />
      )}

      {/* FACESWAP_LOADING */}
      {step === "FACESWAP_LOADING" && (
        <LoadingOverlay messages={FACESWAP_LOADING_MESSAGES} />
      )}

      {/* BILLBOARD / VIDEO_PENDING: show billboard, optionally with video loading */}
      {(step === "BILLBOARD" || step === "VIDEO_PENDING") &&
        billboardImage && (
          <div className="min-h-screen bg-black flex flex-col items-center justify-center">
            <BillboardResult
              image={billboardImage}
              message={billboardMessage}
              isVideoLoading={step === "VIDEO_PENDING"}
            />
          </div>
        )}

      {/* VIDEO_READY: replace billboard with video */}
      {step === "VIDEO_READY" && videoUrl && (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center">
          <VideoPlayer videoUrl={videoUrl} />

          {/* Start Over button */}
          <div className="pb-12 animate-fade-in-up" style={{ animationDelay: "1s" }}>
            <button
              onClick={handleStartOver}
              className="glass rounded-full px-8 py-3 text-white/70 text-sm font-light tracking-wide border border-white/10 hover:text-white hover:border-white/30 transition-all cursor-pointer"
            >
              Start Over
            </button>
          </div>
        </div>
      )}

      {/* VIDEO_READY fallback: if video URL not available yet, show billboard */}
      {step === "VIDEO_READY" && !videoUrl && billboardImage && (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center">
          <BillboardResult
            image={billboardImage}
            message={billboardMessage}
            isVideoLoading={false}
          />
          <div className="pb-12">
            <button
              onClick={handleStartOver}
              className="glass rounded-full px-8 py-3 text-white/70 text-sm font-light tracking-wide border border-white/10 hover:text-white hover:border-white/30 transition-all cursor-pointer"
            >
              Start Over
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
