"use client";

import { useState } from "react";

type FileActionsProps = {
  uploadId: number;
  isSubmitted: boolean;
  isImportant: boolean;
  importantSaved: boolean;
  importantFileId?: number;
};

export function FileActions({
  uploadId,
  isSubmitted,
  isImportant,
  importantSaved,
  importantFileId,
}: FileActionsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isAlreadySaved = isImportant || importantSaved;

  async function handleAction(action: string, actionUploadId = uploadId) {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("action", action);
      formData.append("uploadId", String(actionUploadId));

      const response = await fetch("/api/karyawan/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Gagal memproses berkas");
      }

      window.location.href = "/dashboard/karyawan/berkas";
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-nowrap items-center gap-2">
      {isSubmitted && (
        <>
          <button
            onClick={() => handleAction("add-important")}
            disabled={isSubmitting || isAlreadySaved}
            className="inline-flex items-center rounded-lg border border-[#e8d9a8] bg-[#fbf3db] px-3 py-1.5 text-xs font-medium text-[#956400] hover:bg-[#fbf3db] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isAlreadySaved ? "✓ Data Penting" : "Simpan"}
          </button>
          {isAlreadySaved ? (
            <button
              onClick={() => importantFileId && handleAction("delete-important", importantFileId)}
              disabled={isSubmitting || !importantFileId}
              className="inline-flex items-center rounded-lg border border-red-300 bg-[#fdebec] px-3 py-1.5 text-xs font-medium text-[#9f2f2d] hover:bg-[#fdebec] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Hapus
            </button>
          ) : (
            <button
              onClick={() => handleAction("delete")}
              disabled={isSubmitting}
              className="inline-flex items-center rounded-lg border border-red-300 bg-[#fdebec] px-3 py-1.5 text-xs font-medium text-[#9f2f2d] hover:bg-[#fdebec] disabled:cursor-not-allowed"
            >
              Hapus
            </button>
          )}
        </>
      )}
    </div>
  );
}
