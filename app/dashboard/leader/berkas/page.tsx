import { prisma } from "@/lib/prisma";
import { requireLeader } from "@/lib/auth";
import Link from "next/link";
import { getStartOfCurrentJakartaDay } from "@/lib/upload-time";
import { LeaderUploadForm } from "./leader-upload-form";
import { LeaderFileDeleteButton } from "./leader-file-delete-button";

const CATEGORIES = [
  { key: "DAILY", label: "daily" },
  { key: "CHAT", label: "chat" },
  { key: "PAYMENT", label: "payment" },
  { key: "OTHER", label: "Berkas Lainnya" },
] as const;

export default async function LeaderFilesPage() {
  const leader = await requireLeader();
  const now = new Date();
  const startOfToday = getStartOfCurrentJakartaDay(now);

  const team = await prisma.team.findUnique({
    where: { leaderId: leader.id },
    include: {
      uploads: {
        where: {
          isSubmitted: true,
          submissionDate: { gte: startOfToday },
        },
        orderBy: { createdAt: "desc" },
        include: { user: true },
      },
    },
  });

  const uploads = (team?.uploads ?? []).filter((upload) => upload.user.role !== "LEADER");
  const leaderUploads = (team?.uploads ?? []).filter((upload) => upload.user.role === "LEADER");
  const formatDateTime = (date: Date) =>
    new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date);

  return (
    <main className="min-h-screen bg-[#f8f9fa] px-4 py-5 text-[#111111]">
      <div className="mx-auto max-w-7xl space-y-4">
        <header className="flex flex-col gap-3 rounded-lg border border-[#e5e7eb] bg-white px-4 py-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">Monitoring</p>
            <h1 className="mt-1 text-[15px] font-semibold tracking-tight">Berkas Tim</h1>
            <p className="mt-0.5 text-xs text-[#6b7280]">Pilih kategori untuk melihat semua berkas yang masuk.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-md bg-[#e1f3fe] px-2.5 py-1.5 font-medium text-[#1f6c9f]">{uploads.length} file</span>
            <span className="rounded-md bg-[#fbf3db] px-2.5 py-1.5 font-medium text-[#956400]">{leaderUploads.length} milik saya</span>
            <Link href="/dashboard/leader/data-prioritas" className="rounded-md border border-[#e8d9a8] bg-[#fbf3db] px-2.5 py-1.5 font-medium text-[#956400] hover:bg-[#f7eccb]">
              Lihat Data Prioritas
            </Link>
          </div>
        </header>

        <section aria-label="Kategori berkas">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORIES.map((category) => {
              const count = uploads.filter((u) => u.category === category.key).length;
              return (
                <Link
                  key={category.key}
                  href={`/dashboard/leader/berkas/${category.key.toLowerCase()}`}
                  className="flex items-center justify-between rounded-lg border border-[#e5e7eb] bg-white px-4 py-3 transition hover:border-[#2563eb]"
                >
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-[#6b7280]">{category.label}</p>
                    <p className="mt-1 text-[15px] font-semibold">{count} file</p>
                  </div>
                  <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#f1f3f5] text-[11px] font-bold text-[#111111]">{category.label.replace("Berkas ", "")}</span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
          <div className="space-y-4">
            <div className="rounded-lg border border-[#e5e7eb] bg-white p-4">
              <h2 className="text-xs font-semibold uppercase tracking-wide">Unggah Berkas untuk Tim</h2>
              <p className="mt-1 text-xs text-[#6b7280]">Bagikan file ke seluruh anggota tim.</p>
              <div className="mt-3">
                <LeaderUploadForm />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border border-[#e5e7eb] bg-white">
              <div className="flex items-center justify-between border-b border-[#e5e7eb] px-4 py-3">
                <h2 className="text-xs font-semibold uppercase tracking-wide">Berkas Terbaru</h2>
                <span className="text-[11px] text-[#6b7280]">{uploads.length} file</span>
              </div>
              {uploads.length > 0 ? (
                <div className="divide-y divide-[#f1f3f5]">
                  {uploads.slice(0, 8).map((upload) => (
                    <div key={upload.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-[13px] font-medium">{upload.fileName}</p>
                          {upload.isImportant && <span className="shrink-0 rounded bg-[#fbf3db] px-1.5 py-0.5 text-[10px] font-semibold text-[#956400]">Prioritas</span>}
                        </div>
                        <p className="mt-0.5 text-xs text-[#6b7280]">{upload.user.name} • {upload.category.toLowerCase()}</p>
                        {upload.note && <p className="mt-1 whitespace-pre-wrap break-words text-xs text-[#374151]">Catatan: {upload.note}</p>}
                      </div>
                      <span className="shrink-0 text-[11px] text-[#9ca3af]">{new Date(upload.submissionDate).toLocaleDateString("id-ID", { dateStyle: "short" })}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-[13px] text-[#6b7280]">Belum ada berkas aktif dari karyawan.</p>
                  <p className="mt-1 text-[11px] text-[#9ca3af]">Upload pertama akan muncul di sini.</p>
                </div>
              )}
            </div>

            {leaderUploads.length > 0 && (
              <div className="rounded-lg border border-[#e5e7eb] bg-white">
                <div className="flex items-center justify-between border-b border-[#e5e7eb] px-4 py-3">
                  <h2 className="text-xs font-semibold uppercase tracking-wide">Berkas Saya</h2>
                  <span className="text-[11px] text-[#6b7280]">{leaderUploads.length} file</span>
                </div>
                <div className="divide-y divide-[#f1f3f5]">
                  {leaderUploads.map((upload) => (
                    <div key={upload.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-medium">{upload.fileName}</p>
                        <p className="mt-0.5 text-xs text-[#6b7280]">{upload.category.toLowerCase()} • {formatDateTime(upload.submissionDate)}</p>
                        {upload.note && <p className="mt-1 whitespace-pre-wrap break-words text-xs text-[#374151]">Catatan: {upload.note}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <a href={upload.filePath} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-[#e5e7eb] px-2.5 py-1.5 text-[11px] font-medium text-[#111111] hover:bg-[#f8f9fa]">Lihat</a>
                        <LeaderFileDeleteButton uploadId={upload.id} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="flex items-center justify-between border-t border-[#e5e7eb] pt-3">
          <p className="text-[11px] text-[#6b7280]">Unduh seluruh file melalui halaman kategori masing-masing.</p>
          <Link href="/dashboard/leader/histori-berkas" className="text-xs font-semibold text-[#2563eb] hover:text-[#1d4ed8]">Lihat histori berkas →</Link>
        </section>
      </div>
    </main>
  );
}
