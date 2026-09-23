"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function FilterSelect({
  name,
  placeholder,
  options,
  selected,
  params,
}: {
  name: string;
  placeholder: string;
  options: string[];
  selected: string | null;
  params: Record<string, string | null>;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  function onSelect(value: string) {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v) sp.set(k, v);
    }
    if (value) sp.set(name, value);
    else sp.delete(name);
    router.push(`/dashboard/admin/activities?${sp.toString()}`);
    setOpen(false);
  }

  const label = selected ?? placeholder;

  return (
    <div className="relative w-44">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-[11px] font-medium hover:bg-[#f8f9fa]"
      >
        <span className="truncate">{label}</span>
        <span className="shrink-0 text-[#6b7280]">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="absolute left-0 right-0 z-20 mt-1 max-h-56 overflow-y-auto rounded-lg border border-[#e5e7eb] bg-white shadow-lg">
          {options.map((opt) => (
            <div
              key={opt}
              className={`flex items-center justify-between border-b border-[#f1f3f5] px-3 py-1.5 text-[11px] last:border-0 ${
                selected === opt ? "bg-[#111111] text-white" : "bg-white text-[#111111] hover:bg-[#f8f9fa]"
              }`}
            >
              <button type="button" onClick={() => onSelect(opt)} className="flex-1 text-left font-medium">
                {opt}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
