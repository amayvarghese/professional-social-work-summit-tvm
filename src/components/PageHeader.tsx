import Link from "next/link";
import Stepper from "./Stepper";

type Props = {
  step: 1 | 2 | 3;
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** The event lockup only appears on the first screen. */
  showLockup?: boolean;
};

/** Poster-derived masthead: tricolour rule, then the centred title block. */
export default function PageHeader({
  step,
  eyebrow,
  title,
  subtitle,
  showLockup = false,
}: Props) {
  return (
    <header className="animate-rise text-center">
      <div className="tricolor-rule" />

      <div className="mt-5 flex flex-col items-center gap-3">
        {showLockup ? (
          <Link
            href="/"
            className="leading-tight transition-opacity duration-200 hover:opacity-70"
            aria-label="Kerala Professional Social Work Summit — home"
          >
            <span className="block text-[0.7rem] font-bold uppercase tracking-[0.12em] text-navy">
              Kerala PSW Summit
            </span>
            <span className="block text-[0.68rem] font-medium text-navy/55">
              23 Sep 2026 · Trivandrum
            </span>
          </Link>
        ) : null}

        <span className="eyebrow rounded-full bg-saffron-soft px-2.5 py-1 text-navy">
          {eyebrow}
        </span>
      </div>

      <div className="mt-5">
        <h1 className="display text-[2rem] text-navy sm:text-[2.35rem]">{title}</h1>
        {subtitle ? (
          <p className="mx-auto mt-2.5 max-w-[34ch] text-[0.95rem] leading-relaxed text-navy/65">
            {subtitle}
          </p>
        ) : null}
      </div>

      <div className="mt-6">
        <Stepper current={step} />
      </div>
    </header>
  );
}
