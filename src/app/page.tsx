import RegistrationForm from "@/components/RegistrationForm";
import PageHeader from "@/components/PageHeader";

export default function HomePage() {
  return (
    <main className="app-shell mx-auto flex min-h-dvh sm:min-h-0 sm:px-8 w-full max-w-md flex-col gap-7 px-5 pb-12 pt-6">
      <PageHeader
        step={1}
        showLockup
        eyebrow="Step 1 of 3"
        title={
          <>
            Put yourself
            <span className="mt-1 block text-green">in the frame</span>
          </>
        }
        subtitle="Add your details, take a photo or upload one into the official summit frame, then save it or share it on social media."
      />

      <section
        aria-labelledby="details-heading"
        className="animate-rise card p-5 text-center [animation-delay:80ms]"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-saffron/25 via-white to-green/20 blur-xl"
        />
        <h2 id="details-heading" className="relative mb-1 display text-[1.4rem] text-navy">
          Your details
        </h2>
        <p className="relative mb-5 text-sm text-navy/60">
          Used only to register your participation.
        </p>
        <RegistrationForm />
      </section>

      <footer className="mt-auto flex flex-col items-center gap-3 pt-4 text-center">
        <div className="tricolor-rule w-24 opacity-70" />
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-navy/45">
          Professional Social Workers Congress
        </p>
      </footer>
    </main>
  );
}
