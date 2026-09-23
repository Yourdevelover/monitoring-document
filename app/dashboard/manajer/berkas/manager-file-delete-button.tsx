"use client";

import { useState } from "react";

type ManagerFileDeleteButtonProps = {
  uploadId: number;
};

export function ManagerFileDeleteButton({ uploadId }: ManagerFileDeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!window.confirm("Yakin ingin menghapus berkas ini?")) {
      return;
    }

    setIsDeleting(true);

    try {
      const formData = new FormData();
      formData.append("action", "delete");
      formData.append("uploadId", String(uploadId));

      const response = await fetch("/api/manajer/berkas/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Gagal menghapus berkas");
      }

      window.location.reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Terjadi kesalahan. Silakan coba lagi.");
      setIsDeleting(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="whitespace-nowrap rounded-lg border border-red-300 bg-[#fdebec] px-3 py-1.5 text-xs font-medium text-[#9f2f2d] hover:bg-[#fdebec] disabled:cursor-not-allowed disabled:bg-[#fdebec]"
    >
      {isDeleting ? "Menghapus..." : "Hapus"}
    </button>
  );
}