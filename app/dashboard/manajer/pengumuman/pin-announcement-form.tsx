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
          ? "rounded-lg border border-amber-300 bg-[#fbf3db] px-3 py-1.5 text-xs font-semibold text-[#956400] hover:bg-[#fbf3db]"
          : "rounded-lg border border-[#e5e7eb] px-3 py-1.5 text-xs font-semibold text-[#6b7280] hover:bg-[#f8f9fa]"}
      >
        {isPinned ? "Lepas Sematan" : "Sematkan"}
      </button>
    </form>
  );
}