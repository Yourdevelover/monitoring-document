import { prisma } from "@/lib/prisma";
import { requireManager } from "@/lib/auth";
import Link from "next/link";
import { getStartOfCurrentJakartaDay } from "@/lib/upload-time";
import { ManagerUploadForm } from "./manager-upload-form";
import { ManagerFileDeleteButton } from "./manager-file-delete-button";

const CATEGORIES = [
  { key: "DATA_A", label: "Berkas A" },
  { key: "DATA_B", label: "Data B" },
  { key: "DATA_C", label: "Berkas C" },
] as const;

export default async function ManagerFilesPage() {
  const manager = await requireManager();
  const now = new Date();
  const startOfToday = getStartOfCurrentJakartaDay(now);

  const team = await prisma.team.findUnique({
    where: { managerId: manager.id },
    include: {
      uploads: {
        where: {
          isSubmitted: true,
          isImportant: false,
          submissionDate: { gte: startOfToday },
        },
        orderBy: { createdAt: "desc" },
        include: { user: true },
      },
    },
  });

  const uploads = (team?.uploads ?? []).filter((upload) => upload.user.role !== "MANAGER");
  const managerUploads = (team?.uploads ?? []).filter((upload) => upload.user.role === "MANAGER");
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
          <div className="flex items-center gap-2 text-xs">
            <span className="rounded-md bg-[#e1f3fe] px-2.5 py-1.5 font-medium text-[#1f6c9f]">{uploads.length} file</span>
            <span className="rounded-md bg-[#fbf3db] px-2.5 py-1.5 font-medium text-[#956400]">{managerUploads.length} milik saya</span>
          </div>
        </header>

        <section aria-label="Kategori berkas">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((category) => {
              const count = uploads.filter((u) => u.category === category.key).length;
              return (
                <Link
                  key={category.key}
                  href={`/dashboard/manajer/berkas/${category.key.toLowerCase().replace("data_", "data-")}`}
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
                      <p className="truncate text-[13px] font-medium">{upload.fileName}</p>
                      <p className="mt-0.5 text-xs text-[#6b7280]">{upload.user.name} • {upload.category.replace("DATA_", "Data ")}</p>
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

          <div className="space-y-4">
            <div className="rounded-lg border border-[#e5e7eb] bg-white p-4">
              <h2 className="text-xs font-semibold uppercase tracking-wide">Unggah Berkas untuk Tim</h2>
              <p className="mt-1 text-xs text-[#6b7280]">Bagikan file ke seluruh anggota tim.</p>
              <div className="mt-3">
                <ManagerUploadForm />
              </div>
            </div>

            {managerUploads.length > 0 && (
              <div className="rounded-lg border border-[#e5e7eb] bg-white">
                <div className="flex items-center justify-between border-b border-[#e5e7eb] px-4 py-3">
                  <h2 className="text-xs font-semibold uppercase tracking-wide">Berkas Saya</h2>
                  <span className="text-[11px] text-[#6b7280]">{managerUploads.length} file</span>
                </div>
                <div className="divide-y divide-[#f1f3f5]">
                  {managerUploads.map((upload) => (
                    <div key={upload.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-medium">{upload.fileName}</p>
                        <p className="mt-0.5 text-xs text-[#6b7280]">{upload.category.replace("DATA_", "Data ")} • {formatDateTime(upload.submissionDate)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <a href={upload.filePath} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-[#e5e7eb] px-2.5 py-1.5 text-[11px] font-medium text-[#111111] hover:bg-[#f8f9fa]">Lihat</a>
                        <ManagerFileDeleteButton uploadId={upload.id} />
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
          <Link href="/dashboard/manajer/histori-berkas" className="text-xs font-semibold text-[#2563eb] hover:text-[#1d4ed8]">Lihat histori berkas →</Link>
        </section>
      </div>
    </main>
  );
}
