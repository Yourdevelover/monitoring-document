"use client";

import { useRouter } from "next/navigation";
import { toast } from "@/app/components/toast";

export function DeleteImportantButton({ fileId }: { fileId: number }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Hapus data penting ini?")) return;
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
    }
  }

  return (
    <button
      onClick={handleDelete}
      className="inline-flex items-center rounded-lg border border-red-300 bg-[#fdebec] px-4 py-2 text-sm font-medium text-[#9f2f2d] hover:bg-[#fdebec]"
    >
      Hapus
    </button>
  );
}
