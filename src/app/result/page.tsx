"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { downloadDataUrl, shareFramedImage } from "@/lib/compose";
import PageHeader from "@/components/PageHeader";
import Notice from "@/components/Notice";
import {
  DownloadIcon,
  FlipIcon,
  ShareIcon,
} from "@/components/Icons";

const SHARE_TEXT =
  "I am attending the 1st Kerala Professional Social Work Summit!";

export default function ResultActions() {
  const router = useRouter();
  const [photo, setPhoto] = useState<string | null>(null);
  const [name, setName] = useState("Participant");
  const [participantId, setParticipantId] = useState("");
  const [sharing, setSharing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const data = sessionStorage.getItem("framedPhoto");
    const storedName = sessionStorage.getItem("participantName") || "Participant";
    const id = sessionStorage.getItem("participantId") || "";
    if (!data) {
      router.replace("/");
      return;
    }
    setPhoto(data);
    setName(storedName);
    setParticipantId(id);
  }, [router]);

  function savePhoto() {
    if (!photo) return;
    downloadDataUrl(photo, `kerala-summit-${Date.now()}.jpg`);
    setMessage("Image saved. Check your Downloads or Photos.");
  }

  async function shareEverywhere() {
    if (!photo || sharing) return;
    setSharing(true);
    setError("");
    setMessage("");

    try {
      const result = await shareFramedImage(photo, SHARE_TEXT);
      if (result === "shared") {
        setMessage("Shared successfully.");
      } else if (result === "cancelled") {
        setMessage("Share cancelled.");
      } else {
        setMessage(
          "Image saved. WhatsApp opened with your message — attach the saved photo if needed."
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not share");
    } finally {
      setSharing(false);
    }
  }

  if (!photo) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-3 text-navy">
        <span className="relative h-1.5 w-32 overflow-hidden rounded-full bg-navy/12">
          <span className="animate-sheen absolute inset-0 block" />
        </span>
        <p className="text-sm font-medium text-navy/70">Preparing your photo…</p>
      </main>
    );
  }

  return (
    <main className="app-shell mx-auto flex min-h-dvh sm:min-h-0 sm:px-8 w-full max-w-md flex-col gap-7 px-5 pb-12 pt-6">
      <PageHeader
        step={3}
        eyebrow="Step 3 of 3"
        title={
          <>
            Your frame
            <span className="mt-1 block text-green">is ready</span>
          </>
        }
        subtitle="Save it to your photos, or share the image on WhatsApp and other apps."
      />

      <figure className="animate-rise card overflow-hidden p-3 [animation-delay:60ms]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo}
          alt={`${name}'s photo inside the Kerala Professional Social Work Summit frame`}
          className="w-full rounded-[18px]"
        />
      </figure>

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={shareEverywhere}
          disabled={sharing}
          className="btn btn-saffron w-full"
        >
          <ShareIcon className="h-[18px] w-[18px]" />
          {sharing ? "Opening share…" : "Share on social media"}
        </button>

        <button type="button" onClick={savePhoto} className="btn btn-primary w-full">
          <DownloadIcon className="h-[18px] w-[18px]" />
          Save to photos
        </button>

        <button
          type="button"
          onClick={() => {
            sessionStorage.removeItem("framedPhoto");
            router.push(
              `/camera?id=${encodeURIComponent(participantId)}&name=${encodeURIComponent(name)}`
            );
          }}
          className="btn btn-ghost w-full"
        >
          <FlipIcon className="h-[18px] w-[18px]" />
          Retake photo
        </button>
      </div>

      {message ? <Notice tone="success">{message}</Notice> : null}
      {error ? <Notice tone="error">{error}</Notice> : null}

      <footer className="mt-auto flex flex-col items-center gap-3 pt-4 text-center">
        <div className="tricolor-rule w-24 opacity-70" />
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-navy/45">
          Professional Social Workers Congress
        </p>
      </footer>
    </main>
  );
}
