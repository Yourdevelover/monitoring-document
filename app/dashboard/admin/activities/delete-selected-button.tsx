"use client";
import { useState } from "react";

export function DeleteSelectedButton({ selectedDate }: { selectedDate: string }) {
  const [confirm, setConfirm] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirm(true)}
        className="inline-flex h-[30px] items-center rounded-md border border-red-200 bg-[#fdebec] px-3 text-xs font-medium text-[#9f2f2d] hover:bg-red-100"
      >
        Hapus
      </button>

      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setConfirm(false)}>
          <div className="w-full max-w-sm rounded-md border border-[#e5e7eb] bg-white p-4 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-[13px] font-bold">Hapus log?</h3>
            <p className="mt-1 text-xs text-[#6b7280]">
              Yakin menghapus semua log pada{" "}
              <span className="font-semibold text-[#111111]">
                {new Date(`${selectedDate}T00:00:00Z`).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}
              </span>
              ? Tindakan tidak dapat dibatalkan.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirm(false)}
                className="inline-flex h-[30px] items-center rounded-md border border-[#e5e7eb] px-3 text-xs font-medium hover:bg-[#f8f9fa]"
              >
                Batal
              </button>
              <form action="/api/admin/activities/delete" method="POST">
                <input type="hidden" name="date" value={selectedDate} />
                <button type="submit" className="inline-flex h-[30px] items-center rounded-md bg-[#dc2626] px-3 text-xs font-medium text-white hover:bg-[#b91c1c]">
                  Hapus
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}