"use client";

import { useRouter } from "next/navigation";

export function BackToPreviousButton({
  label = "Kembali",
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className={
        `inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 ${className}`.trim()
      }
    >
      {label}
    </button>
  );
}
