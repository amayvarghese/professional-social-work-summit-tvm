import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Participant } from "@/lib/models/Participant";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const mobile = String(body.mobile ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();

    if (!name || !mobile || !email) {
      return NextResponse.json(
        { error: "Name, mobile, and email are required." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
    }

    if (!/^[0-9+\-\s]{8,15}$/.test(mobile)) {
      return NextResponse.json(
        { error: "Enter a valid mobile number." },
        { status: 400 }
      );
    }

    await connectDB();
    const participant = await Participant.create({ name, mobile, email });

    return NextResponse.json({
      id: participant._id.toString(),
      name: participant.name,
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Could not save your details. Check MongoDB connection." },
      { status: 500 }
    );
  }
}
