"use client";

import { useEffect, useState } from "react";

type NotificationItem = {
  id: number;
  title: string;
  content: string;
  isPinned: boolean;
  createdAt: Date;
  leader: { name: string; phoneNumber: string | null };
};

type ActiveDialog =
  | { type: "notification"; item: NotificationItem }
  | { type: "profile"; leader: NotificationItem["leader"] }
  | null;

function formatDate(date: Date) {
  const dateLabel = date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const timeLabel = date
    .toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false })
    .replace(":", ".");

  return `${dateLabel}, ${timeLabel}`;
}

export function NotificationList({ announcements }: { announcements: NotificationItem[] }) {
  const [activeDialog, setActiveDialog] = useState<ActiveDialog>(null);

  useEffect(() => {
    if (!activeDialog) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setActiveDialog(null);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeDialog]);

  return (
    <>
      <section aria-label="Daftar notifikasi" className="w-full">
        {announcements.length > 0 ? (
          <div className="space-y-3">
            {announcements.map((item) => (
              <article
                key={item.id}
                className="flex w-full items-stretch gap-2 rounded-xl border border-white/80 bg-white/75 p-2 shadow-[0_4px_18px_rgba(15,23,42,0.07)] backdrop-blur-xl"
              >
                <button
                  type="button"
                  aria-haspopup="dialog"
                  onClick={() => setActiveDialog({ type: "notification", item })}
                  className="min-w-0 flex-1 rounded-lg px-3 py-3 text-left transition-colors hover:bg-white/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2563eb] sm:px-4"
                >
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-sm font-semibold text-[#111111]">
                      {item.title || "Pengumuman tim"}
                    </span>
                    {item.isPinned && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#956400]">
                        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#956400]" />
                        Penting
                      </span>
                    )}
                  </span>
                  <span className="mt-2 block whitespace-pre-wrap text-sm leading-6 text-[#4b5563]">
                    {item.content}
                  </span>
                </button>

                <button
                  type="button"
                  aria-label={`Lihat profil ${item.leader.name}`}
                  aria-haspopup="dialog"
                  onClick={() => setActiveDialog({ type: "profile", leader: item.leader })}
                  className="my-2 mr-2 flex w-[4.5rem] shrink-0 flex-col items-center justify-center gap-1 rounded-lg px-1 text-center transition-colors hover:bg-[#f1f3f5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2563eb] sm:w-24"
                >
                  <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e9edf2] text-sm font-semibold text-[#344054]">
                    {item.leader.name.trim().charAt(0).toUpperCase()}
                  </span>
                  <span className="w-full truncate text-[11px] font-medium text-[#4b5563]">
                    Profil
                  </span>
                </button>
              </article>
            ))}
          </div>
        ) : (
          <p className="py-6 text-sm text-[#6b7280]">Belum ada notifikasi untuk tim Anda.</p>
        )}
      </section>

      {activeDialog && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-[#111111]/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setActiveDialog(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="notification-dialog-title"
            className="my-auto max-h-[calc(100vh-2rem)] w-full max-w-md overflow-y-auto rounded-lg border border-[#e5e7eb] bg-white p-5"
          >
            {activeDialog.type === "profile" ? (
              <>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">Profil pengirim</p>
                <h2 id="notification-dialog-title" className="mt-2 text-base font-semibold text-[#111111]">
                  {activeDialog.leader.name}
                </h2>
                <dl className="mt-4 divide-y divide-[#e5e7eb] text-sm">
                  <div className="flex items-center justify-between gap-4 py-3">
                    <dt className="text-[#6b7280]">Nomor telepon</dt>
                    <dd className="text-right font-medium text-[#111111]">
                      {activeDialog.leader.phoneNumber ?? "Belum diisi"}
                    </dd>
                  </div>
                </dl>
              </>
            ) : (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs text-[#6b7280]">Dari {activeDialog.item.leader.name}</p>
                    <h2 id="notification-dialog-title" className="mt-1 break-words text-base font-semibold text-[#111111]">
                      {activeDialog.item.title || "Pengumuman tim"}
                    </h2>
                  </div>
                  {activeDialog.item.isPinned && (
                    <span className="shrink-0 text-xs font-medium text-[#956400]">Penting</span>
                  )}
                </div>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-[#4b5563]">
                  {activeDialog.item.content}
                </p>
                <time className="mt-4 block text-xs text-[#6b7280]">
                  {formatDate(activeDialog.item.createdAt)}
                </time>
              </>
            )}
            <button
              type="button"
              onClick={() => setActiveDialog(null)}
              className="mt-5 w-full rounded-md bg-[#111111] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#333333] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563eb]"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </>
  );
}