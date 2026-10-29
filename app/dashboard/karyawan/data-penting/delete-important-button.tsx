"use client";

import { useRouter } from "next/navigation";
import { toast } from "@/app/components/toast";
import { useState } from "react";
import { LoadingIndicator } from "@/app/components/loading-indicator";

export function DeleteImportantButton({ fileId }: { fileId: number }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (isDeleting) return;
    if (!confirm("Hapus data penting ini?")) return;
    setIsDeleting(true);
    try {
      const formData = new FormData();
      formData.append("action", "delete-important");
      formData.append("uploadId", String(fileId));
      const res = await fetch("/api/karyawan/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menghapus");
      toast(data.message || "Data penting berhasil dihapus.");
      router.push("/dashboard/karyawan/data-penting");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Terjadi kesalahan.", "error");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="inline-flex items-center rounded-lg border border-red-300 bg-[#fdebec] px-4 py-2 text-sm font-medium text-[#9f2f2d] hover:bg-[#fdebec] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isDeleting ? <LoadingIndicator label="Menghapus..." /> : "Hapus"}
    </button>
  );
}
