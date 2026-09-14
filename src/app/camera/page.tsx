import { Suspense } from "react";
import CameraCapture from "@/components/CameraCapture";

export default function CameraPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-dvh flex-col items-center justify-center gap-3 text-navy">
          <span className="relative h-1.5 w-32 overflow-hidden rounded-full bg-navy/12">
            <span className="animate-sheen absolute inset-0 block" />
          </span>
          <p className="text-sm font-medium text-navy/70">Loading camera…</p>
        </main>
      }
    >
      <CameraCapture />
    </Suspense>
  );
}
