import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 text-center">
      <div className="tricolor-rule w-20" />
      <h1 className="display mt-6 text-[2rem] text-navy">Photo not found</h1>
      <p className="mt-3 text-[0.95rem] leading-relaxed text-navy/65">
        This share link may have expired, or the address was mistyped.
      </p>
      <Link href="/" className="btn btn-saffron mt-7 w-full">
        Create your own frame
      </Link>
    </main>
  );
}
