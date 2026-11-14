"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type MemberTarget = {
  id: number;
  name: string;
  targetValue: number;
  currentValue: number;
};

export function MemberTargetDialog({
  memberName,
  targets,
  rank,
  progress,
}: {
  memberName: string;
  targets: MemberTarget[];
  rank: number;
  progress: number;
}) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <>
      <tr
        tabIndex={0}
        aria-label={`Lihat semua target ${memberName}`}
        aria-haspopup="dialog"
        onClick={() => setIsOpen(true)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setIsOpen(true);
          }
        }}
        className="cursor-pointer border-b border-[#f1f3f5] outline-none last:border-0 hover:bg-[#f8f9fa] focus-visible:bg-[#f8f9fa] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#2563eb]"
      >
        <td className="px-4 py-3">
          <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold ${rank === 1 && progress > 0 ? "bg-[#fbf3db] text-[#956400]" : "bg-[#f1f3f5] text-[#6b7280]"}`}>
            {rank}
          </span>
        </td>
        <td className="whitespace-nowrap px-4 py-3 font-semibold text-[#111111]">{memberName}</td>
        <td className="px-4 py-3 text-[#6b7280]">
          {targets.length > 0 ? targets.map((target) => (
            <p key={target.id} className="py-0.5">
              {target.name}: {target.currentValue.toLocaleString("id-ID")} / {target.targetValue.toLocaleString("id-ID")}
            </p>
          )) : <span className="text-[#9ca3af]">Belum ada target</span>}
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="h-2 min-w-24 flex-1 rounded bg-[#f1f3f5]">
              <div className={`h-full rounded ${progress >= 100 ? "bg-[#346538]" : "bg-[#956400]"}`} style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
            </div>
            <span className="w-12 text-right font-semibold text-[#956400]">{progress.toFixed(0)}%</span>
          </div>
        </td>
      </tr>

      {isOpen && createPortal((
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-[#111111]/50 p-4"
          onClick={() => setIsOpen(false)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby={`member-target-title-${targets[0]?.id ?? memberName.replace(/\s+/g, "-")}`}
            className="my-auto max-h-[calc(100vh-2rem)] w-full max-w-xl overflow-y-auto rounded-lg border border-[#e5e7eb] bg-white shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="flex items-start justify-between gap-4 border-b border-[#e5e7eb] px-4 py-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6b7280]">Target karyawan</p>
                <h2 id={`member-target-title-${targets[0]?.id ?? memberName.replace(/\s+/g, "-")}`} className="mt-1 text-sm font-semibold">{memberName}</h2>
                <p className="mt-1 text-xs text-[#6b7280]">{targets.length} target pada periode ini</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Tutup daftar target"
                className="rounded px-2 py-1 text-lg leading-none text-[#6b7280] hover:bg-[#f1f3f5]"
              >
                ×
              </button>
            </header>

            <div className="space-y-2 p-4">
              {targets.map((target) => {
                const progress = target.targetValue > 0 ? (target.currentValue / target.targetValue) * 100 : 0;
                const reached = progress >= 100;
                return (
                  <article key={target.id} className="border border-[#e5e7eb] bg-white px-3 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="break-words text-xs font-semibold">{target.name}</h3>
                        <p className="mt-1 text-xs text-[#6b7280]">
                          {target.currentValue.toLocaleString("id-ID")} / {target.targetValue.toLocaleString("id-ID")}
                        </p>
                      </div>
                      <span className={`shrink-0 text-xs font-semibold ${reached ? "text-[#346538]" : "text-[#956400]"}`}>
                        {progress.toFixed(1)}%
                      </span>
                    </div>
                    <div className="mt-2 h-2 rounded bg-[#f1f3f5]">
                      <div
                        className={`h-full rounded ${reached ? "bg-[#346538]" : "bg-[#956400]"}`}
                        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                      />
                    </div>
                  </article>
                );
              })}
              {targets.length === 0 && (
                <p className="border border-dashed border-[#d1d5db] px-3 py-8 text-center text-xs text-[#6b7280]">
                  Karyawan ini belum memiliki target pada periode ini.
                </p>
              )}
            </div>
          </section>
        </div>
      ), document.body)}
    </>
  );
}