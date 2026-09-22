"use client";

type DeleteAnnouncementFormProps = {
  announcementId: number;
};

export function DeleteAnnouncementForm({ announcementId }: DeleteAnnouncementFormProps) {
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    if (!window.confirm("Hapus pengumuman ini?")) {
      event.preventDefault();
    }
  }

  return (
    <form
      action="/api/manager/announcement/delete"
      method="POST"
      onSubmit={handleSubmit}
    >
      <input type="hidden" name="announcementId" value={announcementId} />
      <button
        type="submit"
        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
      >
        Hapus
      </button>
    </form>
  );
}