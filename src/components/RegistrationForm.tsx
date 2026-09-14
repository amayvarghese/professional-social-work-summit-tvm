"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRightIcon } from "./Icons";
import Notice from "./Notice";

const FIELDS = [
  {
    id: "name",
    label: "Full name",
    type: "text",
    placeholder: "Your name",
    autoComplete: "name",
    inputMode: undefined,
    hint: undefined,
  },
  {
    id: "mobile",
    label: "Mobile",
    type: "tel",
    placeholder: "10-digit mobile number",
    autoComplete: "tel",
    inputMode: "tel" as const,
    hint: "We only use this to confirm your registration.",
  },
  {
    id: "email",
    label: "Email",
    type: "email",
    placeholder: "you@example.com",
    autoComplete: "email",
    inputMode: "email" as const,
    hint: undefined,
  },
] as const;

export default function RegistrationForm() {
  const router = useRouter();
  const [values, setValues] = useState({ name: "", mobile: "", email: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");

      const params = new URLSearchParams({ id: data.id, name: data.name });
      router.push(`/camera?${params.toString()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="relative flex w-full flex-col gap-5">
      {FIELDS.map((f) => (
        <div key={f.id} className="flex flex-col gap-1.5">
          <label
            htmlFor={f.id}
            className="text-center text-[0.8rem] font-bold uppercase tracking-[0.08em] text-navy/75"
          >
            {f.label}
          </label>
          <input
            id={f.id}
            name={f.id}
            required
            type={f.type}
            inputMode={f.inputMode}
            autoComplete={f.autoComplete}
            placeholder={f.placeholder}
            value={values[f.id]}
            onChange={(e) => setValues((v) => ({ ...v, [f.id]: e.target.value }))}
            aria-describedby={f.hint ? `${f.id}-hint` : undefined}
            className="field text-center"
          />
          {f.hint ? (
            <p id={`${f.id}-hint`} className="text-center text-xs text-navy/50">
              {f.hint}
            </p>
          ) : null}
        </div>
      ))}

      {error ? <Notice tone="error">{error}</Notice> : null}

      <button type="submit" disabled={loading} className="btn btn-saffron mt-1 w-full">
        {loading ? "Saving…" : "Continue to camera"}
        {loading ? null : <ArrowRightIcon className="h-[18px] w-[18px]" />}
      </button>
    </form>
  );
}
