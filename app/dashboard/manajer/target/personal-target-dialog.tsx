"use client";

import { useState } from "react";

export function PersonalTargetDialog({ period }: { period: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex min-h-10 items-center rounded-md border border-[#e5e7eb] bg-white px-3 text-xs font-semibold text-[#111111] transition hover:border-[#9ca3af] hover:bg-[#f8f9fa]"
      >
        + Masukkan target pribadi
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-[#111111]/40 p-4"
          onClick={() => setIsOpen(false)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="personal-target-dialog-title"
            className="my-auto w-full max-w-md rounded-lg border border-[#e5e7eb] bg-white p-4"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-3 border-b border-[#e5e7eb] pb-3">
              <div>
                <h2 id="personal-target-dialog-title" className="text-sm font-semibold">Masukkan target pribadi</h2>
                <p className="mt-1 text-xs text-[#6b7280]">Periode {period}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Tutup form target pribadi"
                className="rounded-md px-2 py-1 text-xs font-medium text-[#6b7280] hover:bg-[#f1f3f5]"
              >
                Tutup
              </button>
            </div>

            <form action="/api/manajer/target" method="POST" className="grid grid-cols-2 gap-3">
              <input type="hidden" name="period" value={period} />
              <label className="col-span-2 text-xs font-medium text-[#374151]">
                Nama Target
                <input
                  name="name"
                  required
                  maxLength={100}
                  placeholder="Shoppe"
                  className="mt-1 h-10 w-full rounded-md border border-[#e5e7eb] px-3 text-sm outline-none focus:border-[#2563eb]"
                />
              </label>
              <label className="text-xs font-medium text-[#374151]">
                Target 100%
                <input
                  name="targetValue"
                  required
                  type="number"
                  min="0.01"
                  step="any"
                  placeholder="Target 60jt"
                  className="mt-1 h-10 w-full rounded-md border border-[#e5e7eb] px-3 text-sm outline-none focus:border-[#2563eb]"
                />
              </label>
              <label className="text-xs font-medium text-[#374151]">
                Progres sekarang
                <input
                  name="currentValue"
                  type="number"
                  min="0"
                  step="any"
                  defaultValue={0}
                  className="mt-1 h-10 w-full rounded-md border border-[#e5e7eb] px-3 text-sm outline-none focus:border-[#2563eb]"
                />
              </label>
              <div className="col-span-2 flex justify-end gap-2 border-t border-[#e5e7eb] pt-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="min-h-9 rounded-md border border-[#e5e7eb] px-3 text-xs font-medium text-[#374151] hover:bg-[#f8f9fa]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="min-h-9 rounded-md bg-[#111111] px-3 text-xs font-medium text-white hover:bg-[#222]"
                >
                  Simpan Target
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
