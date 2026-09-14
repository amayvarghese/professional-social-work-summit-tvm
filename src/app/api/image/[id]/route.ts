import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Share } from "@/lib/models/Share";

export const runtime = "nodejs";

/** Serves a stored share image. Shares are immutable, so cache hard. */
export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await connectDB();
    // Not .lean(): lean() hands back a BSON Binary rather than a Node Buffer,
    // which serialises to an empty body.
    const share = await Share.findOne({ shareId: id }).select("image contentType");

    const image: Buffer | undefined = share?.image;
    if (!image?.byteLength) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return new NextResponse(new Uint8Array(image), {
      headers: {
        "Content-Type": share?.contentType || "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Image fetch error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
