import { AlertIcon, CheckIcon } from "./Icons";

type Props = { tone: "success" | "error"; children: React.ReactNode };

/** Status message with an icon so colour is never the only signal. */
export default function Notice({ tone, children }: Props) {
  const success = tone === "success";
  return (
    <p
      role={success ? "status" : "alert"}
      className={`flex items-start gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-medium ${
        success
          ? "border-green-mid/25 bg-green-soft text-green"
          : "border-red-200 bg-red-50 text-red-800"
      }`}
    >
      <span className="mt-0.5 shrink-0">
        {success ? <CheckIcon className="h-4 w-4" /> : <AlertIcon className="h-4 w-4" />}
      </span>
      <span>{children}</span>
    </p>
  );
}
