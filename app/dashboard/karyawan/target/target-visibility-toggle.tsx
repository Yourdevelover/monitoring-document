"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/app/components/toast";

export function TargetVisibilityToggle({ targetId, isPublic }: { targetId: number; isPublic: boolean }) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  async function handleChange() {
    if (isSaving) return;
    setIsSaving(true);
    const nextIsPublic = !isPublic;
    const formData = new FormData();
    formData.set("action", "visibility");
    formData.set("id", String(targetId));
    formData.set("isPublic", String(nextIsPublic));

    try {
      const response = await fetch("/api/karyawan/target", { method: "POST", body: formData });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Gagal mengubah visibilitas target.");
      }
      toast(nextIsPublic ? "Target kini terlihat oleh tim." : "Target kini hanya terlihat oleh Anda dan Leader.", "success");
      router.refresh();
    } catch (error) {
      toast(error instanceof Error ? error.message : "Terjadi kesalahan.", "error");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <label className="flex min-h-10 items-center justify-between gap-3 rounded-md border border-[#e5e7eb] bg-white px-3 py-2 text-xs">
      <span className="text-[#6b7280]">{isPublic ? "Terlihat oleh anggota tim" : "Pribadi, terlihat oleh Leader"}</span>
      <input
        type="checkbox"
        role="switch"
        checked={isPublic}
        disabled={isSaving}
        onChange={handleChange}
        aria-label={isPublic ? "Jadikan target pribadi" : "Bagikan target ke anggota tim"}
        className="peer sr-only"
      />
      <span aria-hidden="true" className="relative h-6 w-11 shrink-0 rounded-full bg-[#d1d5db] transition peer-checked:bg-[#346538] after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-5 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#2563eb]" />
    </label>
  );
}