import { CheckIcon } from "./Icons";

const STEPS = ["Details", "Photo", "Share"] as const;

/** Progress rail shown on every screen so people always know where they are. */
export default function Stepper({ current }: { current: 1 | 2 | 3 }) {
  return (
    <ol className="flex items-center gap-2" aria-label="Progress">
      {STEPS.map((label, i) => {
        const step = i + 1;
        const done = step < current;
        const active = step === current;

        return (
          <li key={label} className="flex flex-1 items-center gap-2">
            <div className="flex flex-1 flex-col gap-1.5">
              <span
                className={`h-1.5 rounded-full transition-colors duration-200 ${
                  done
                    ? "bg-green-mid"
                    : active
                      ? "bg-saffron"
                      : "bg-navy/12"
                }`}
              />
              <span
                className={`flex items-center justify-center gap-1 text-[0.7rem] font-semibold tracking-wide ${
                  active ? "text-navy" : done ? "text-green-mid" : "text-navy/40"
                }`}
              >
                {done ? <CheckIcon className="h-3 w-3" /> : null}
                {label}
              </span>
            </div>
          </li>
        );
      })}
      <span className="sr-only">
        Step {current} of {STEPS.length}: {STEPS[current - 1]}
      </span>
    </ol>
  );
}
