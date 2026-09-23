"use client";

import { FormEvent, useRef, useState } from "react";

const CATEGORY_OPTIONS = [
  { key: "DATA_A", label: "Berkas A" },
  { key: "DATA_B", label: "Berkas B" },
  { key: "DATA_C", label: "Berkas C" },
] as const;

export function ManagerUploadForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [category, setCategory] = useState<string>("DATA_A");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedFile) {
      setError("Silakan pilih file terlebih dahulu.");
      return;
    }

    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("category", category);
      formData.append("title", CATEGORY_OPTIONS.find((c) => c.key === category)?.label ?? category);
      formData.append("file", selectedFile);

      const response = await fetch("/api/manajer/berkas/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Gagal mengunggah berkas");
      }

      setSuccess("Berkas berhasil dibagikan ke tim.");
      setSelectedFile(null);
      setCategory("DATA_A");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan. Silakan coba lagi.");
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
        {isSubmitting ? "Mengunggah..." : "Bagikan ke Tim"}
      </button>
    </form>
  );
}