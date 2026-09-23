"use client";
import { useState } from "react";

export function DateFilter({
  dateList,
  selectedDate,
}: {
  dateList: { date: string; count: number }[];
  selectedDate: string | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative w-44">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-[11px] font-medium hover:bg-[#f8f9fa]"
      >
        <span className="truncate">
          {selectedDate
            ? new Date(`${selectedDate}T00:00:00Z`).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
            : "Pilih tanggal"}
        </span>
        <span className="shrink-0 text-[#6b7280]">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="absolute left-0 right-0 z-20 mt-1 max-h-56 overflow-y-auto rounded-lg border border-[#e5e7eb] bg-white shadow-lg">
          {dateList.length > 0 ? (
            dateList.map(({ date, count }) => (
              <div
                key={date}
                className={`flex items-center justify-between border-b border-[#f1f3f5] px-3 py-1.5 text-[11px] last:border-0 ${
                  selectedDate === date ? "bg-[#111111] text-white" : "bg-white text-[#111111] hover:bg-[#f8f9fa]"
                }`}
              >
                <a href={`/dashboard/admin/activities?date=${date}`} className="flex-1 font-medium">
                  {new Date(`${date}T00:00:00Z`).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                  <span className={selectedDate === date ? "ml-1.5 text-white/60" : "ml-1.5 text-[#9ca3af]"}>({count} log)</span>
                </a>
              </div>
            ))
          ) : (
            <p className="py-2 text-center text-[11px] text-[#6b7280]">Belum ada log.</p>
          )}
        </div>
      )}
    </div>
  );
}
