"use client";

import { ApiForm } from "@/app/components/api-form";

type DeleteAnnouncementFormProps = {
  announcementId: number;
};

export function DeleteAnnouncementForm({ announcementId }: DeleteAnnouncementFormProps) {
  return (
    <ApiForm
      action="/api/manager/announcement/delete"
      confirmMessage="Hapus pengumuman ini?"
      successMessage="Pengumuman berhasil dihapus."
    >
      <input type="hidden" name="announcementId" value={announcementId} />
      <button
        type="submit"
        className="rounded-lg border border-[#fdebec] px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-[#fdebec]"
      >
        Hapus
      </button>
    </ApiForm>
  );
}