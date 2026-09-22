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
    <form onSubmit={handleSubmit} className="space-y-3">
      <label className="block text-sm font-medium text-slate-700">
        Kategori
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
        >
          {CATEGORY_OPTIONS.map((option) => (
            <option key={option.key} value={option.key}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm font-medium text-slate-700">
        Pilih file
        <input
          ref={fileInputRef}
          type="file"
          name="file"
          onChange={handleFileChange}
          className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
          required
        />
      </label>

      {selectedFile && (
        <p className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
          File dipilih: <span className="font-medium">{selectedFile.name}</span>
        </p>
      )}

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {success ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {success}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting || !selectedFile}
        className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-500"
      >
        {isSubmitting ? "Mengunggah..." : "Bagikan ke Tim"}
      </button>
    </form>
  );
}