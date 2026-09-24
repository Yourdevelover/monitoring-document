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
        `inline-flex h-[30px] items-center justify-center rounded-md border border-[#e5e7eb] bg-white px-3 text-xs font-medium text-[#111111] transition hover:bg-[#f8f9fa] ${className}`.trim()
      }
    >
      {label}
    </button>
  );
}
