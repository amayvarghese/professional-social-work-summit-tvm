import Link from "next/link";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { Share } from "@/lib/models/Share";
import { appUrlFrom } from "@/lib/appUrl";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  try {
    await connectDB();
    const share = await Share.findOne({ shareId: id }).select("name").lean();
    if (!share) return { title: "Summit photo" };
    return {
      title: `${share.name} · Kerala Social Work Summit`,
      openGraph: {
        title: `${share.name} is proud to be part of the summit`,
        // WhatsApp/Facebook need an absolute URL for the preview image.
        images: [`${appUrlFrom()}/api/image/${id}`],
      },
    };
  } catch {
    return { title: "Summit photo" };
  }
}

export default async function SharePage({ params }: Props) {
  const { id } = await params;

  let share: { name: string } | null = null;
  try {
    await connectDB();
    const doc = await Share.findOne({ shareId: id }).select("name").lean();
    if (doc) share = { name: doc.name };
  } catch {
    share = null;
  }

  if (!share) notFound();

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col bg-navy text-white">
      <div className="tricolor-rule" />

      <div className="flex flex-1 items-center justify-center px-4 py-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/api/image/${id}`}
          alt={`${share.name}'s photo inside the Kerala Professional Social Work Summit frame`}
          className="h-auto max-h-[78dvh] w-full rounded-2xl object-contain shadow-[0_30px_70px_-25px_rgba(0,0,0,0.75)]"
        />
      </div>

      <div className="space-y-4 bg-gradient-to-t from-black/35 via-navy/80 to-transparent px-6 pb-9 pt-8 text-center">
        <p className="display text-[1.6rem] leading-tight text-white">
          <span className="text-gold">{share.name}</span>
          <span className="block text-white/85">is proud to be part of this summit</span>
        </p>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/55">
          23 September 2026 · Trivandrum
        </p>
        <Link href="/" className="btn btn-saffron w-full">
          Create your own frame
        </Link>
      </div>
    </main>
  );
}
