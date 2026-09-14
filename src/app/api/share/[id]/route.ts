import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Share } from "@/lib/models/Share";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await connectDB();
    const share = await Share.findOne({ shareId: id })
      .select("shareId name createdAt")
      .lean();

    if (!share) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      shareId: share.shareId,
      name: share.name,
      imagePath: `/api/image/${share.shareId}`,
      createdAt: share.createdAt,
    });
  } catch (error) {
    console.error("Share fetch error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
