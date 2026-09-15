import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { nanoid } from "nanoid";
import { connectDB } from "@/lib/mongodb";
import { Share } from "@/lib/models/Share";
import { Participant } from "@/lib/models/Participant";
import { appUrlFrom } from "@/lib/appUrl";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name ?? "Participant").trim();
    const participantId = body.participantId
      ? String(body.participantId)
      : undefined;
    const imageData = String(body.imageData ?? "");

    const match = imageData.match(/^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/);
    if (!match) {
      return NextResponse.json({ error: "Unsupported image format." }, { status: 400 });
    }

    const contentType = `image/${match[1] === "jpg" ? "jpeg" : match[1]}`;
    const buffer = Buffer.from(match[2], "base64");

    // Mongo caps a document at 16MB; stay well under it.
    if (buffer.byteLength > 6_000_000) {
      return NextResponse.json({ error: "Image is too large." }, { status: 413 });
    }

    const shareId = nanoid(10);

    await connectDB();
    await Share.create({ shareId, participantId, name, image: buffer, contentType });

    // Best-effort back-reference. The share already exists at this point, so a
    // bad or stale participant id must not fail the whole request.
    if (participantId && mongoose.isValidObjectId(participantId)) {
      try {
        await Participant.findByIdAndUpdate(participantId, { shareId });
      } catch (err) {
        console.error("Participant backfill failed:", err);
      }
    }

    const appUrl = appUrlFrom(request);
    return NextResponse.json({
      shareId,
      shareUrl: `${appUrl}/p/${shareId}`,
      imagePath: `/api/image/${shareId}`,
    });
  } catch (error) {
    console.error("Share create error:", error);
    return NextResponse.json(
      { error: "Could not create share link." },
      { status: 500 }
    );
  }
}
