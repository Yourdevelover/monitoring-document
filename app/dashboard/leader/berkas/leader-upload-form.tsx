"use client";

import { FormEvent, useRef, useState } from "react";
import { toast } from "@/app/components/toast";

const CATEGORY_OPTIONS = [
  { key: "DAILY", label: "daily" },
  { key: "CHAT", label: "chat" },
  { key: "PAYMENT", label: "payment" },
  { key: "OTHER", label: "Berkas Lainnya" },
] as const;

export function LeaderUploadForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [category, setCategory] = useState<string>("DAILY");
  const [note, setNote] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedFile) {
      setError("Silakan pilih file terlebih dahulu.");
      return;
    }

    setError(null);
    setSuccess(null);
    setIsConfirmOpen(true);
  }

  async function confirmUpload() {
    if (!selectedFile) {
      setError("Silakan pilih file terlebih dahulu.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("category", category);
      formData.append("title", CATEGORY_OPTIONS.find((c) => c.key === category)?.label ?? category);
      formData.append("note", note);
      formData.append("file", selectedFile);

      const response = await fetch("/api/leader/berkas/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Gagal mengunggah berkas");
      }

      toast("Berkas berhasil dibagikan ke tim.", "success");
      setSelectedFile(null);
      setCategory("DAILY");
      setNote("");
      setIsConfirmOpen(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      window.location.reload();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan. Silakan coba lagi.";
      setError(msg);
      toast(msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2.5">
      <div className="grid grid-cols-2 gap-2">
        <label className="block text-[11px] font-medium uppercase tracking-wide text-[#6b7280]">
          Kategori
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="mt-1 block w-full rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-[13px] text-[#111111]"
          >
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-[11px] font-medium uppercase tracking-wide text-[#6b7280]">
          Pilih file
          <input
            ref={fileInputRef}
            type="file"
            name="file"
            onChange={handleFileChange}
            className="mt-1 block w-full rounded-lg border border-[#e5e7eb] bg-white px-3 py-1.5 text-[13px] text-[#111111] file:mr-2 file:rounded file:border-0 file:bg-[#111111] file:px-2 file:py-1 file:text-[11px] file:font-medium file:text-white"
            required
          />
        </label>
      </div>

      {selectedFile && (
        <p className="rounded-md bg-[#e1f3fe] px-3 py-1.5 text-[12px] font-medium text-[#1f6c9f]">Dipilih: {selectedFile.name}</p>
      )}

      {error && <p className="rounded-md bg-[#fdebec] px-3 py-1.5 text-[12px] font-medium text-[#9f2f2d]">{error}</p>}
      {success && <p className="rounded-md bg-[#edf3ec] px-3 py-1.5 text-[12px] font-medium text-[#346538]">{success}</p>}

      <button
        type="submit"
        disabled={isSubmitting || !selectedFile}
        className="inline-flex w-full items-center justify-center rounded-lg bg-[#111111] px-4 py-2 text-[13px] font-medium text-white transition hover:bg-[#333333] disabled:cursor-not-allowed disabled:bg-[#9ca3af]"
      >
        Bagikan ke Tim
      </button>
      {isConfirmOpen && selectedFile && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-[#111111]/50 p-4" onClick={() => !isSubmitting && setIsConfirmOpen(false)}>
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="leader-upload-confirm-title"
            className="my-auto w-full max-w-md rounded-lg border border-[#e5e7eb] bg-white p-4 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="leader-upload-confirm-title" className="text-sm font-semibold text-[#111111]">Konfirmasi Berkas</h2>
            <p className="mt-2 break-words text-xs text-[#6b7280]">{selectedFile.name} · {CATEGORY_OPTIONS.find((item) => item.key === category)?.label}</p>
            <p className="mt-2 text-xs text-[#6b7280]">Tambahkan catatan jika diperlukan, lalu lanjutkan untuk membagikan berkas ke tim.</p>
            <label className="mt-4 block text-xs font-medium text-[#374151]">
              Catatan (opsional)
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                maxLength={1000}
                rows={2}
                placeholder="Tambahkan keterangan untuk berkas ini"
                className="mt-1 w-full resize-none rounded-md border border-[#d1d5db] px-3 py-2 text-sm font-normal text-[#111111] outline-none focus:border-[#2563eb]"
              />
            </label>
            {error && <p className="mt-2 rounded-md bg-[#fdebec] px-3 py-2 text-xs font-medium text-[#9f2f2d]">{error}</p>}
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setIsConfirmOpen(false)}
                className="rounded-md border border-[#e5e7eb] px-3 py-2 text-xs font-medium text-[#374151] hover:bg-[#f8f9fa] disabled:opacity-60"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={confirmUpload}
                className="rounded-md bg-[#111111] px-3 py-2 text-xs font-medium text-white hover:bg-[#333333] disabled:opacity-60"
              >
                {isSubmitting ? "Mengirim..." : "Ya, Kirim"}
              </button>
            </div>
          </section>
        </div>
      )}
    </form>
  );
}