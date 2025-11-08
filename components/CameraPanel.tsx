"use client";

import { useEffect, useRef, useState } from "react";
import { Video, VideoOff } from "lucide-react";
import { detectFaceMetrics } from "@/lib/faceTracking";
import { initAudioAnalysis, getAudioMetrics, cleanupAudioAnalysis } from "@/lib/audioAnalysis";
import { useAppStore, type SessionMetrics } from "@/lib/store";
import { calculateEyeContactScore, normalizeHeadPose } from "@/lib/signalProcessing";

interface CameraPanelProps {
  onMetricsUpdate?: (metrics: SessionMetrics) => void;
}

export function CameraPanel({ onMetricsUpdate }: CameraPanelProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const { interviewState, addMetrics } = useAppStore();

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
        audio: true,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsStreaming(true);
        setDemoMode(false);

        // Initialize audio analysis
        await initAudioAnalysis(stream);

        // Start face tracking loop
        startTracking();
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setError("Camera access denied. Using demo mode.");
      setDemoMode(true);
      setIsStreaming(false);
    }
  };

  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    try {
      cleanupAudioAnalysis();
    } catch (error) {
      console.error("Error cleaning up audio:", error);
    }

    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
      } catch (error) {
        console.error("Error stopping tracks:", error);
      }
      streamRef.current = null;
    }

    if (videoRef.current) {
      try {
        videoRef.current.srcObject = null;
        videoRef.current.pause();
      } catch (error) {
        console.error("Error stopping video:", error);
      }
    }

    setIsStreaming(false);
  };

  const startTracking = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    // Wait for video dimensions
    if (!video.videoWidth || !video.videoHeight) {
      setTimeout(() => startTracking(), 100);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    let lastMetrics: SessionMetrics | null = null;
    let frameCount = 0;
    let isTracking = true;

    const track = async () => {
      if (!isTracking || interviewState !== "live" || !video.videoWidth) {
        if (isTracking) {
          animationFrameRef.current = requestAnimationFrame(track);
        }
        return;
      }

      try {
        // Draw video to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Throttle face detection to ~15fps for performance
        frameCount++;
        if (frameCount % 4 === 0) {
          // Detect face metrics
          try {
            const faceMetrics = await detectFaceMetrics(video);
            const audioMetrics = getAudioMetrics();

            if (faceMetrics) {
              const eyeContact = calculateEyeContactScore(faceMetrics.eyeOpenness, faceMetrics.headYaw);
              const posture = normalizeHeadPose(faceMetrics.headYaw, faceMetrics.headPitch, faceMetrics.headRoll);

              const metrics: SessionMetrics = {
                eyeContact: Math.round(eyeContact * 100),
                smile: Math.round(faceMetrics.smileProbability * 100),
                posture: Math.round(posture * 100),
                speakingRatio: Math.round(audioMetrics.speakingRatio * 100),
                fillerWords: audioMetrics.fillerWordCount,
                timestamp: Date.now(),
              };

              lastMetrics = metrics;
              addMetrics(metrics);
              onMetricsUpdate?.(metrics);
            } else if (lastMetrics) {
              // Use last known metrics if face not detected
              onMetricsUpdate?.(lastMetrics);
            }
          } catch (error) {
            console.error("Face detection error:", error);
            // Continue with last known metrics or defaults
            if (lastMetrics) {
              onMetricsUpdate?.(lastMetrics);
            }
          }
        } else if (lastMetrics) {
          // Update with last known metrics even if not detecting face this frame
          onMetricsUpdate?.(lastMetrics);
        }
      } catch (error) {
        console.error("Tracking error:", error);
      }

      if (isTracking) {
        animationFrameRef.current = requestAnimationFrame(track);
      }
    };

    track();

    // Store cleanup function
    return () => {
      isTracking = false;
    };
  };

  useEffect(() => {
    if (interviewState === "live" && !isStreaming && !demoMode) {
      startCamera();
    } else if (interviewState !== "live") {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [interviewState]);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative rounded-2xl overflow-hidden shadow-glow-lg bg-ink/10">
        {isStreaming || demoMode ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-auto block"
              style={{ transform: "scaleX(-1)" }}
            />
            <canvas ref={canvasRef} className="hidden" />
            {demoMode && (
              <div className="absolute inset-0 flex items-center justify-center bg-ink/50">
                <div className="text-center text-white p-6 glass-effect rounded-xl">
                  <VideoOff className="w-12 h-12 mx-auto mb-4" />
                  <p className="text-lg font-semibold">Demo Mode</p>
                  <p className="text-sm mt-2">Camera access unavailable</p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="aspect-video flex items-center justify-center bg-gradient-to-br from-sky-100 to-blue-100">
            <div className="text-center">
              <Video className="w-16 h-16 mx-auto mb-4 text-sky-500" />
              <p className="text-ink/70">Camera not started</p>
            </div>
          </div>
        )}
      </div>
      {error && (
        <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400 rounded-lg text-ink">
          {error}
        </div>
      )}
    </div>
  );
}

