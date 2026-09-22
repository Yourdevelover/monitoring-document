"use client";

type PinAnnouncementFormProps = {
  announcementId: number;
  isPinned: boolean;
};

export function PinAnnouncementForm({ announcementId, isPinned }: PinAnnouncementFormProps) {
  return (
    <form action="/api/manager/announcement/pin" method="POST">
      <input type="hidden" name="announcementId" value={announcementId} />
      <button
        type="submit"
        className={isPinned
          ? "rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100"
          : "rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"}
      >
        {isPinned ? "Lepas Sematan" : "Sematkan"}
      </button>
    </form>
  );
}