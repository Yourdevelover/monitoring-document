import { prisma } from "@/lib/prisma";
import { requireManager } from "@/lib/auth";
import Link from "next/link";
import { getStartOfCurrentJakartaDay } from "@/lib/upload-time";
import { ManagerUploadForm } from "./manager-upload-form";
import { ManagerFileDeleteButton } from "./manager-file-delete-button";

const CATEGORIES = [
  { key: "DATA_A", label: "Berkas A" },
  { key: "DATA_B", label: "Berkas B" },
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
    <main className="min-h-screen text-slate-900">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Monitoring</p>
          <h1 className="mt-1 text-2xl font-bold">Berkas Tim</h1>
          <p className="mt-1 text-sm text-slate-500">Pilih kategori untuk melihat semua berkas yang masuk.</p>
        </header>

        <section>
          <div className="grid gap-4 md:grid-cols-3" aria-label="Kategori berkas">
            {CATEGORIES.map((category) => (
              <Link
                key={category.key}
                href={`/dashboard/manajer/berkas/${category.key.toLowerCase().replace("data_", "data-")}`}
                className="min-h-32 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-400 hover:shadow-md"
              >
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">Kategori</p>
                <p className="mt-2 text-xl font-semibold text-slate-900">{category.label}</p>
                <p className="mt-2 text-sm text-slate-500">
                  {uploads.filter((upload) => upload.category === category.key).length} file aktif
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-lg font-semibold">Berkas Terbaru</h2>
              <p className="text-sm text-slate-500">Karyawan yang baru mengirim berkas.</p>
            </div>
            <span className="text-xs text-slate-500">{uploads.length} file aktif</span>
          </div>

          {uploads.length > 0 ? (
            <div className="divide-y divide-slate-200">
              {uploads.slice(0, 10).map((upload) => (
                <div key={upload.id} className="py-4">
                  <div className="min-w-0">
                    <p className="break-all font-semibold text-slate-900">{upload.fileName}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {upload.user.name} • {upload.category.replace("DATA_", "Data ")}
                    </p>
                    <p className="text-xs text-slate-500">Dikirim {formatDateTime(upload.submissionDate)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="border-y border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-600">
              Belum ada berkas aktif dari karyawan.
            </p>
          )}
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Unggah Berkas untuk Tim</h2>
            <p className="text-sm text-slate-500">Bagikan file ke seluruh anggota tim.</p>
          </div>
          <div className="max-w-md">
            <ManagerUploadForm />
          </div>
        </section>

        {managerUploads.length > 0 && (
          <section>
            <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-lg font-semibold">Berkas Saya</h2>
                <p className="text-sm text-slate-500">Berkas yang sudah Anda bagikan ke tim.</p>
              </div>
              <span className="text-xs text-slate-500">{managerUploads.length} file dibagikan</span>
            </div>
            <div className="divide-y divide-slate-200">
              {managerUploads.map((upload) => (
                <div key={upload.id} className="py-4">
                  <div className="min-w-0 flex items-center justify-between gap-4">
                    <div>
                      <p className="break-all font-semibold text-slate-900">{upload.fileName}</p>
                      <p className="mt-1 text-sm text-slate-600">
                        {upload.category.replace("DATA_", "Data ")} • Dibagikan {formatDateTime(upload.submissionDate)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={upload.filePath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="whitespace-nowrap rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                      >
                        Lihat
                      </a>
                      <ManagerFileDeleteButton uploadId={upload.id} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
          <p className="text-xs text-slate-500">Unduh seluruh file melalui halaman kategori masing-masing.</p>
          <Link href="/dashboard/manajer/histori-berkas" className="text-sm font-semibold text-blue-600 hover:text-blue-800">
            Lihat histori berkas →
          </Link>
        </section>
      </div>
    </main>
  );
}
