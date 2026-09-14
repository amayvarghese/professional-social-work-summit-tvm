"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FRAME } from "@/lib/frame";
import { composeFramedPhoto } from "@/lib/compose";
import PageHeader from "./PageHeader";
import Notice from "./Notice";
import { ArrowLeftIcon, CameraIcon, FlipIcon } from "./Icons";

export default function CameraCapture() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const participantId = searchParams.get("id") || "";
  const name = searchParams.get("name") || "Participant";

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [capturing, setCapturing] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const startCamera = useCallback(async () => {
    setError("");
    setReady(false);
    stopStream();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 1280 },
        },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setReady(true);
      }
    } catch {
      // Permission denied / no camera: stay silent and just leave the
      // viewfinder in its loading state rather than showing an error.
      setReady(false);
    }
  }, [facingMode, stopStream]);

  useEffect(() => {
    startCamera();
    return () => stopStream();
  }, [startCamera, stopStream]);

  async function capture() {
    if (!videoRef.current || capturing) return;
    setCapturing(true);
    try {
      const dataUrl = await composeFramedPhoto(videoRef.current, {
        mirror: facingMode === "user",
      });
      stopStream();
      sessionStorage.setItem("framedPhoto", dataUrl);
      sessionStorage.setItem("participantId", participantId);
      sessionStorage.setItem("participantName", name);
      router.push("/result");
    } catch {
      setError("Could not capture photo. Please try again.");
      setCapturing(false);
    }
  }

  const guideLeft = ((FRAME.cx - FRAME.radius) / FRAME.size) * 100;
  const guideTop = ((FRAME.cy - FRAME.radius) / FRAME.size) * 100;
  const guideSize = ((FRAME.radius * 2) / FRAME.size) * 100;

  return (
    <main className="app-shell mx-auto flex min-h-dvh sm:min-h-0 sm:px-8 w-full max-w-md flex-col gap-7 px-5 pb-10 pt-6">
      <PageHeader
        step={2}
        eyebrow="Step 2 of 3"
        title={
          <>
            Center your face
            <span className="mt-1 block text-saffron-ink">and capture</span>
          </>
        }
        subtitle={
          <>
            Hi <span className="font-semibold text-navy">{name}</span> — keep your face inside
            the circle. The summit frame is applied right after you capture.
          </>
        }
      />

      <div className="animate-rise card overflow-hidden p-3 [animation-delay:60ms]">
        <div className="relative aspect-square w-full overflow-hidden rounded-[18px] bg-navy">
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className={`absolute inset-0 h-full w-full object-cover ${
              facingMode === "user" ? "scale-x-[-1]" : ""
            }`}
          />

          {/* Soft guide only — the printed frame appears after capture */}
          <div
            aria-hidden
            className="pointer-events-none absolute z-10 rounded-full border-2 border-white/85 shadow-[0_0_0_9999px_rgba(0,20,73,0.5)]"
            style={{
              left: `${guideLeft}%`,
              top: `${guideTop}%`,
              width: `${guideSize}%`,
              height: `${guideSize}%`,
            }}
          />

          {!ready && !error ? (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-navy/80 text-white">
              <span className="relative h-1.5 w-28 overflow-hidden rounded-full bg-white/20">
                <span className="animate-sheen absolute inset-0 block" />
              </span>
              <span className="text-sm font-medium">Opening camera…</span>
            </div>
          ) : null}

          {capturing ? (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-navy/75 text-white">
              <span className="relative h-1.5 w-28 overflow-hidden rounded-full bg-white/20">
                <span className="animate-sheen absolute inset-0 block" />
              </span>
              <span className="text-sm font-medium">Applying your frame…</span>
            </div>
          ) : null}
        </div>
      </div>

      {error ? <Notice tone="error">{error}</Notice> : null}

      <div className="flex items-center justify-between gap-4 px-2">
        <button
          type="button"
          onClick={() => setFacingMode((m) => (m === "user" ? "environment" : "user"))}
          className="flex h-14 w-14 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-2xl border border-navy/15 bg-white/85 text-navy transition-colors duration-200 hover:border-navy/35 hover:bg-white"
          aria-label="Switch between front and back camera"
        >
          <FlipIcon className="h-5 w-5" />
          <span className="text-[0.6rem] font-semibold">Flip</span>
        </button>

        <button
          type="button"
          onClick={capture}
          disabled={!ready || capturing}
          className="animate-capture grid h-[4.5rem] w-[4.5rem] cursor-pointer place-items-center rounded-full border-4 border-white bg-saffron-ink text-white shadow-[0_16px_34px_-12px_rgba(196,78,0,0.9)] transition-colors duration-200 hover:bg-[color:var(--saffron-ink-hover)] disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Capture photo"
        >
          <CameraIcon className="h-7 w-7" />
        </button>

        <button
          type="button"
          onClick={() => router.push("/")}
          className="flex h-14 w-14 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-2xl border border-navy/15 bg-white/85 text-navy transition-colors duration-200 hover:border-navy/35 hover:bg-white"
          aria-label="Go back to your details"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span className="text-[0.6rem] font-semibold">Back</span>
        </button>
      </div>
    </main>
  );
}
