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
      className="whitespace-nowrap rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:bg-red-100"
    >
      {isDeleting ? "Menghapus..." : "Hapus"}
    </button>
  );
}